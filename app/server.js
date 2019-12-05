const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const express = require('express')
const favicon = require('serve-favicon')
const compression = require('compression')
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')
const redirects = require('./router/301.json')
const axios = require('axios');

const isProd = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')
const useMicroCache = process.env.MICRO_CACHE !== 'false'
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

const app = express()

const template = fs.readFileSync(resolve('./assets/index.template.html'), 'utf-8')
  .replace(
    "DATAHUB_API_BASE_URL",
    // process.env.DATAHUB_API_BASE_URL.substr(0, process.env.DATAHUB_API_BASE_URL.lastIndexOf('/'))
    process.env.DATAHUB_API_BASE_URL
  );

function createRenderer (bundle, options) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return createBundleRenderer(bundle, Object.assign(options, {
    template,
    // for component caching
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }),
    // this is only needed when vue-server-renderer is npm-linked
    basedir: resolve('./public'),
    // recommended for performance
    runInNewContext: false
  }))
}

let renderer
let readyPromise
if (isProd) {
  // In production: create server renderer using built server bundle.
  // The server bundle is generated by vue-ssr-webpack-plugin.
  const bundle = require('./public/vue-ssr-server-bundle.json')
  // The client manifests are optional, but it allows the renderer
  // to automatically infer preload/prefetch links and directly add <script>
  // tags for any async chunks used during render, avoiding waterfall requests.
  const clientManifest = require('./public/vue-ssr-client-manifest.json')
  renderer = createRenderer(bundle, {
    clientManifest
  })
} else {
  // In development: setup the dev server with watch and hot-reload,
  // and create a new renderer on bundle / index template update.
  readyPromise = require('./build/setup-dev-server')(app, (bundle, options) => {
    renderer = createRenderer(bundle, options)
  })
}

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0
})

app.use(compression({ threshold: 0 }))
app.use(favicon('./static/favicon-mpt.ico'))
app.use('/static', serve('./static', true))
app.use('/csv', serve('./static/microdados/csv', true))
app.use('/public', serve('./public', true))
app.use('/robots.txt', serve('./static/robots.txt', true))
app.use('/humans.txt', serve('./static/humans.txt', true))

// Manifest
app.use('/manifest', serve('./static/manifest.json', true))
app.use('/build_manifest', serve('./public/vue-ssr-client-manifest.json', true))

app.get('/sitemap.xml', (req, res) => {
  res.setHeader("Content-Type", "text/xml")
  res.sendFile(resolve('./static/sitemap.xml'))
})

// 301 redirect for changed routes
Object.keys(redirects).forEach(k => {
  app.get(k, (req, res) => res.redirect(301, redirects[k]))
})

// 1-second microcache.
// https://www.nginx.com/blog/benefits-of-microcaching-nginx/
const microCache = LRU({
  max: 100,
  maxAge: 1000
})

// since this app has no user-specific content, every page is micro-cacheable.
// if your app involves user-specific content, you need to implement custom
// logic to determine whether a request is cacheable based on its url and
// headers.
const isCacheable = req => useMicroCache

function render (req, res) {
  const s = Date.now()

  res.setHeader("Content-Type", "text/html")
  res.setHeader("Server", serverInfo)

  const handleError = err => {
    if (err && err.code === 404) {
      res.status(404).end('404 | Page Not Found')
    } else {
      // Render Error Page or Redirect
      res.status(500).end('500 | Internal Server Error')
      console.error(`error during render : ${req.url}`)
      console.error(err.stack)
    }
  }

  const cacheable = isCacheable(req)
  if (cacheable) {
    const hit = microCache.get(req.url)
    if (hit) {
      if (!isProd) {
        console.log(`cache hit!`)
      }
      return res.end(hit)
    }
  }

  const context = {
    title: 'Vuetify', // default title
    url: req.url
  }
  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err)
    }
    res.end(html)
    if (cacheable) {
      microCache.set(req.url, html)
    }
    if (!isProd) {
      console.log(`whole request: ${Date.now() - s}ms`)
    }
  })
}

app.get('/api-proxy/*', (req, res) => {
  
  const apiDataMap = { 
    datahub: [process.env.DATAHUB_API_BASE_URL, 
              process.env.DATAHUB_APP_KEY] 
  }

  const splitArray = req.url.split("/")
  const resourceUrl = splitArray.slice(3).join('/')
  const apiUrl = apiDataMap[splitArray[2]][0] + "/" + resourceUrl

  axios({
    method: 'get',
    url: apiUrl,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
      'X-Gravitee-Api-Key': apiDataMap[splitArray[2]][1]
    }
  })
    .then(function(response) {
      // handle success
      res.json(response.data);
    })
    .catch(function(error) {
      // handle error
      if (error.response) {
        res.status(error.response.status).send(error.response.data)
      } else {
        // Something happened in setting up the request that triggered an Error
        res.status(400).send(error)
      }
    })
});

/*
 |--------------------------------------------------------------------------
 | Authentication
 |--------------------------------------------------------------------------
 */

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const querystring = require('querystring');

/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
app.post('/auth/google', function(req, res) {
  axios({
    method: 'post',
    url: 'https://accounts.google.com/o/oauth2/token',
    data: querystring.stringify({
      code: req.body.code,
      client_id: process.env.GOOGLE_CLIENTID,
      client_secret: process.env.GOOGLE_CLIENTSECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).then(function (response) {
      res.json(response.data);
    })
  .catch(function(error) {
      console.log(error);
      // handle error
      if (error.response) {
        res.status(error.response.status).send(error.response.data)
      } else {
        // Something happened in setting up the request that triggered an Error
        res.status(500).json(error)
      }
    })
  // let accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  // let peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  // let params = {
  //   code: req.body.code,
  //   client_id: req.body.clientId,
  //   client_secret: process.env.GOOGLE_CLIENTSECRET,
  //   redirect_uri: req.body.redirectUri,
  //   grant_type: 'authorization_code'
  // };

  // // Step 1. Exchange authorization code for access token.
  // axios.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
  //   let accessToken = token.access_token;
  //   let headers = { Authorization: 'Bearer ' + accessToken };
  //   console.log(response);

    // Step 2. Retrieve profile information about the current user.
    // axios.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
    //   if (profile.error) {
    //     return res.status(500).send({message: profile.error.message});
    //   } else {
    //     let token = createJWT(profile);
    //     console.log(token);
    //     res.send({ token: token });
    //   }
      // // Step 3a. Link user accounts.
      // if (req.header('Authorization')) {
      //   User.findOne({ google: profile.sub }, function(err, existingUser) {
      //     if (existingUser) {
      //       return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
      //     }
      //     var token = req.header('Authorization').split(' ')[1];
      //     var payload = jwt.decode(token, config.TOKEN_SECRET);
      //     User.findById(payload.sub, function(err, user) {
      //       if (!user) {
      //         return res.status(400).send({ message: 'User not found' });
      //       }
      //       user.google = profile.sub;
      //       user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
      //       user.displayName = user.displayName || profile.name;
      //       user.save(function() {
      //         var token = createJWT(user);
      //         res.send({ token: token });
      //       });
      //     });
      //   });
      // } else {
      //   // Step 3b. Create a new user account or return an existing one.
      //   User.findOne({ google: profile.sub }, function(err, existingUser) {
      //     if (existingUser) {
      //       return res.send({ token: createJWT(existingUser) });
      //     }
      //     var user = new User();
      //     user.google = profile.sub;
      //     user.picture = profile.picture.replace('sz=50', 'sz=200');
      //     user.displayName = profile.name;
      //     user.save(function(err) {
      //       var token = createJWT(user);
      //       res.send({ token: token });
      //     });
      //   });
      // }
    // });
  // });
});

/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
app.post('/auth/facebook', function(req, res) {
  axios({
    method: 'post',
    url: 'https://graph.facebook.com/v2.4/oauth/access_token',
    data: querystring.stringify({
      code: req.body.code,
      client_id: process.env.FACEBOOK_CLIENTID,
      client_secret: process.env.FACEBOOK_CLIENTSECRET,
      redirect_uri: req.body.redirectUri,
    }),
    headers: {
      'content-type': 'application/json'
    }
  }).then(function (response) {
      console.log(response);
      res.json(response.data);
    })
  .catch(function(error) {
      console.log(error);
      // handle error
      if (error.response) {
        res.status(error.response.status).send(error.response.data)
      } else {
        // Something happened in setting up the request that triggered an Error
        res.status(500).json(error)
      }
    })
});

app.get('*', isProd ? render : (req, res) => {
  readyPromise.then(() => render(req, res))
})

const port = process.env.PORT || 8081
app.listen(port, '0.0.0.0', () => {
  console.log(`server started at localhost:${port}`)
})
