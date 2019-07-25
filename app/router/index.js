import Vue from 'vue'
import Router from 'vue-router'

// The meta data for your routes
const meta = require('./meta.json')

// Function to create routes
// Is default lazy but can be changed
function route (path, view) {
  return {
    path: path,
    meta: meta[path],
    component: resolve => import(`pages/${view}View.vue`).then(resolve)
  }
}

Vue.use(Router)

export function createRouter () {
    const router = new Router({
      base: __dirname,
      mode: 'history',
      scrollBehavior: () => ({ y: 0 }),
      routes: [
        // Definitivas
        route('/', 'Welcome'),
        route('/saibamais', 'sobre/SaibaMais'),
        route('/saibamais/:tab', 'sobre/SaibaMais'),
        route('/fontes', 'sobre/Fontes'),
        route('/fontes/:tab', 'sobre/Fontes'),
        route('/estudo/:idEstudo', 'Estudo'),

        // Rotas antigas
        // route('/localidade/:idLocalidade', 'Localidade'),
        // route('/observatorio/:idObservatorio', 'Observatorio'),
        // route('/embreve/:idObservatorio', 'ObservatorioEmBreve'),
        // route('/observatoriomapa/:idObservatorio', 'ObservatorioMapa'),
        
        // Rotas novas para melhor identidade dos observatórios

        route('/trabalhodecente', 'Observatorio'),
        route('/diversidade', 'Observatorio'),
        route('/sst', 'Observatorio'),
        route('/trabalhoescravo', 'Observatorio'),
        route('/trabalhoinfantil', 'Observatorio'),
        
        route('/trabalhodecente/localidade/:idLocalidade', 'Localidade'),
        route('/diversidade/localidade/:idLocalidade', 'Localidade'),
        route('/sst/localidade/:idLocalidade', 'Localidade'),
        route('/trabalhoescravo/localidade/:idLocalidade', 'Localidade'),
        route('/trabalhoinfantil/localidade/:idLocalidade', 'Localidade'),

        route('/trabalhodecente/smartmap', 'ObservatorioMapa'),
        route('/diversidade/smartmap', 'ObservatorioMapa'),
        route('/sst/smartmap', 'ObservatorioMapa'),
        route('/trabalhoescravo/smartmap', 'ObservatorioMapa'),
        route('/trabalhoinfantil/smartmap', 'ObservatorioMapa'),

        route('/trabalhodecente/embreve', 'ObservatorioEmBreve'),
        route('/diversidade/embreve', 'ObservatorioEmBreve'),
        route('/sst/embreve', 'ObservatorioEmBreve'),
        route('/trabalhoescravo/embreve', 'ObservatorioEmBreve'),
        route('/trabalhoinfantil/embreve', 'ObservatorioEmBreve'),

        // Provisórias
        route('/mapa/:nmIndicador', 'Mapa'),
        // Global redirect for 404
        { path: '*', redirect: '/' }
      ]
    })

    // Send a pageview to Google Analytics
    router.beforeEach((to, from, next) => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', to.path)
            ga('send', 'pageview')
        }

        // TODO Remover no lancamento dos demais observatorios
        // if (process.env.PHASE_OUT && !to.path.includes('embreve')) {
        //   let idCheckAvailable = this.identifyObservatory(to.path.split('/')[1]);
          
        //   if (idCheckAvailable && idCheckAvailable != 'td' && idCheckAvailable != 'sst') {
        //     next({ "path": '/embreve/'+idCheckAvailable })
        //   } else {
        //     next()
        //   }
        // } else {
        //   next()
        // }

        // TODO Reativar no lancamento dos demais observatorios
        next()
    })

    return router
}
