const NumberFormatter = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        formatNumber(valor, formato, casasDecimais, multiplier = 1, collapse = null, signed = false, uiTags = true){
          if (multiplier === null || multiplier === undefined) {
            multiplier = 1;
          }

          if (signed === null || signed === undefined) {
            signed = false;
          }

          if (uiTags === null || uiTags === undefined) {
            uiTags = true;
          }

          var openUiTags = '';
          var closeUiTags = '';

          let unitPrefix = '';

          if(valor === null || valor === undefined){
            return "-"; 
          }
          valor = parseFloat(valor) * multiplier;
          
          // Verifica a ordem de grandeza do número, para poder reduzir o tamanho da string
          let collapseSuffix = '';
          let magnitude = 0;
          if (collapse) {
            magnitude = Math.floor((Math.floor(Math.abs(valor)).toString().length - 1)/3);

            if (magnitude > 0) {
              if ((collapse.uiTags === null || collapse.uiTags === undefined || collapse.uiTags) && uiTags) {
                uiTags = true;
              } else {
                uiTags = false;
              }

            }

            if (uiTags) {
              openUiTags = '<span>';
              closeUiTags = '</span>';
            }

            valor = valor / Math.pow(10, magnitude * 3);
            // Define o termo usado no final da string
            switch (magnitude) {
              case 1:
                collapseSuffix = openUiTags + 'mil' + closeUiTags;
                break;
              case 2:
                collapseSuffix = openUiTags + 'mi' + closeUiTags;
                break;
              case 3:
                collapseSuffix = openUiTags + 'bi' + closeUiTags;
                break;
              case 4:
                collapseSuffix = openUiTags + 'tri' + closeUiTags;
                break;
            }

            // Se contrair o dado, ver o formato resultante
            if (magnitude > 0) {
              casasDecimais = collapse.casasDecimais ? collapse.casasDecimais : null;
              formato = collapse.formato ? collapse.formato : null;
              unitPrefix = formato == 'monetario' ? openUiTags + "R$" + closeUiTags : '';
            }
            // if (magnitude > 0) {
            //   unitPrefix = "&plusmn;" + unitPrefix;
            // }
          } else {
            if (uiTags) {
              openUiTags = '<span>';
              closeUiTags = '</span>';
            }

            // Define um prefixo de unidade
            unitPrefix = formato == 'monetario' ? openUiTags + "R$" + closeUiTags : '';
            if (signed && valor > 0) {
              unitPrefix = "+";
            }
          }
          
          casasDecimais = casasDecimais ? casasDecimais : 1;
          // Define a configuração do locale
          let localeConfig = {
            maximumFractionDigits: casasDecimais
          }


          if (formato == 'inteiro') {
            localeConfig.maximumFractionDigits = 0;
          } else {
            // if (formato == 'real' || formato == 'porcentagem' || formato == 'monetario') {
            //   if (Math.floor((valor - Math.floor(valor))*(Math.pow(10, casasDecimais))) == 0) {
            //     // Se o número for efetivamente um inteiro e não tiver collapse, retira a casa decimal
            //     localeConfig.maximumFractionDigits = 0;
            //   }
            // }
            localeConfig.minimumFractionDigits = localeConfig.maximumFractionDigits;
          }

          // Substitui o collapseConfig apenas na porcentagem
          if (formato == 'porcentagem') collapseSuffix = openUiTags + "%" + closeUiTags;
          return unitPrefix + valor.toLocaleString('pt-br', localeConfig) + collapseSuffix;
        },

        getPaceString(interval, inverse = false) {
          // console.log(interval);
          if (inverse){
            interval = 1 / interval;
          }
          let days=Math.floor((interval/(1000*60*60*24)));
          let tmpInterval = interval - days*1000*60*60*24;
          let hours = Math.floor(tmpInterval/(1000*60*60));
          tmpInterval -= hours*1000*60*60;
          let minutes = Math.floor(tmpInterval/(1000*60));
          tmpInterval -= minutes*1000*60;
          let seconds = Math.floor(tmpInterval/(1000));
          tmpInterval -= seconds*1000;
          let milis = Math.floor(tmpInterval);
  
          let strInterval = "";
          let started = false;
          if (days > 0) {
            strInterval += " " + days + "d";
            started = true;
          }
          if (started) {
            strInterval += " " + hours + "h";
          } else {
            if (hours > 0) {
              strInterval += " " + hours + "h";
              started = true;
            }
          }
          if (started) {
            strInterval += " " + minutes + "m";
          } else {
            if (minutes > 0) {
              strInterval += " " + minutes + "m";
              started = true;
            }
          }
          if (started) {
            strInterval += " " + seconds + "s";
          } else {
            if (seconds > 0) {
              strInterval += " " + seconds + "s";
              started = true;
            }
          }
          if (!started) {
            strInterval += " " + milis + "ms";
          }
  
          return strInterval;
        },
        
      }
    });
  }
}

export default NumberFormatter;