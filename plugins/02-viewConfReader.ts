// import * as yaml from "js-yaml"
import { YamlFetcherService } from "~/utils/service/singleton/yamlFetcher"
import { UrlTransformService } from "~/utils/service/singleton/urlTransform"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { NumberTransformService } from "~/utils/service/singleton/numberTransform"
import { ObjectTransformService } from "~/utils/service/singleton/objectTransform"
import { Indicators } from "~/utils/model/indicators"
import { useSnackbarStore } from "~/store/snackbar"

const textTransformService = new TextTransformService()
const numberTransformService = new NumberTransformService()
const objectTransformService = new ObjectTransformService()
const indicators = new Indicators()

export default defineNuxtPlugin((_context: any) => {
  // const { app } = context

  const snackbar = useSnackbarStore()
  const sendDataStructureError =  (error: string = "Falha ao carregar dados do componente.") => {
    snackbar.showSnackbar({
      color: "error",
      text: error,
    })
  }
  const loadYamlArray = async (currentStruct: any, yamlArray: any[], finalCbFunction: (context: any) => void) => {
    const result = await YamlFetcherService.loadYamlArray(currentStruct, yamlArray)
    finalCbFunction(result)

    // const _this = this
    // const promises: any = []
    // const promises_alt: any = []

    // const fnSendDataStructureError = this.sendDataStructureError
    // const errorMsg = "Falha ao carregar a dimensão - não foi possível carregar o arquivo da dimensão (.yaml)."
    // const errorStruct = { secoes: [{ name: errorMsg, cards: [] }] }

    // for (const yamlConfIndex in yamlArray) {
    //   promises[yamlConfIndex] = new Promise(
    //     function (resolve, reject) {
    //       _this.$axios.$get(basePath + yamlArray[yamlConfIndex].main + ".yaml")
    //         .then((response) => {
    //           resolve(yaml.safeLoad(response, { json: true }))
    //         }).catch((error) => {
    //           if (error.reason === "end of the stream or a document separator is expected") {
    //             // yaml not found
    //             resolve(null)
    //           } else {
    //             // yaml error
    //             fnSendDataStructureError(errorMsg)
    //             resolve(errorStruct)
    //           }
    //         })
    //     }
    //   )

    //   if (yamlArray[yamlConfIndex].alt) {
    //     promises_alt[yamlConfIndex] = new Promise(
    //       function (resolve, reject) {
    //         _this.$axios.$get(basePath + yamlArray[yamlConfIndex].alt + ".yaml")
    //           .then((response) => {
    //             resolve(yaml.safeLoad(response, { json: true }))
    //           }).catch(() => { resolve(null) })
    //       }
    //     )
    //   }
    // }

    // // Define a execução após a realização de todos os promises
    // await Promise.all(promises).then(
    //   (structs) => {
    //     const checked = []
    //     let result = currentStruct || {}
    //     for (const structIndx in structs) {
    //       if (structs[structIndx]) {
    //         checked.push(structIndx)
    //         result = Object.assign(result, structs[structIndx])
    //       }
    //     }

    //     Promise.all(promises_alt).then(
    //       (structs_alt) => {
    //         for (const structIndx in structs_alt) {
    //           if (structs_alt[structIndx] && !checked.includes(structIndx)) {
    //             result = Object.assign(result, structs_alt[structIndx])
    //           }
    //         }
    //         finalCbFunction(result)
    //       }
    //     )
    //   }
    // )
  }

  const fillDataStructure = (structure: any, customParams: any, cbFunction: (dataset: Record<string, any> | string, rules: Record<string, any>, structure:Record<string, any>, addedParams?: Record<string, any> | string, metadata?: Record<string, any>) => void, addedParams?: any) => {
    const fnSendDataStructureError = sendDataStructureError
    const fnReformDataset = reformDataset
    if (structure !== null && structure !== undefined) {
      let msgError = "Falha ao carregar dados do componente."
      if (addedParams && addedParams.msgError) {
        msgError = addedParams.msgError
      }

      if (addedParams && addedParams.endpoint) {
        // Endpoint que sobrescreve a definição do structure.api.
        // Normalmente associado ao algum comportamento reativo,
        // como filtro.
        if (!Array.isArray(structure.api)) {
          // If the structure defines a single API call, execute the
          // callback after the axios call.
          $fetch(UrlTransformService.getApiUrl(addedParams.endpoint))
            .then((result: any) => {
              let dataset = fnReformDataset(
                result.dataset,
                structure.api.options,
                customParams
              )
              if (structure.api_options) {
                dataset = fnReformDataset(
                  dataset,
                  structure.api_options,
                  customParams
                )
              }
              cbFunction(
                dataset,
                structure.args,
                structure,
                addedParams,
                result.metadata
              )
            }
            ).catch((error) => {
              console.log(error)
              fnSendDataStructureError(msgError)
            })
        } else {
          // If the structure defines a single API call, execute the
          // callback after all the axios calls are resolved.
          const promises: Promise<any>[] = []
          for (const indexApi in addedParams.endpoint) {
            const promise = $fetch(UrlTransformService.getApiUrl(addedParams.endpoint[indexApi]))
              .then((result: any) => {
                return fnReformDataset(
                  result.dataset,
                  structure.api[indexApi].options,
                  customParams
                )
              }).catch((error) => {
                console.log(error)
                fnSendDataStructureError(msgError)
              })
            // // Cria um promise
            //       const promise = new Promise(
            //         function (resolve, reject) {
            //           _this.$axios(apiCall)
            //             .then((result) => {
            //               resolve(
            //                 fnReformDataset(
            //                   result.data.dataset,
            //                   structure.api[indexApi].options,
            //                   customFunctions,
            //                   customParams
            //                 )
            //               )
            //             }).catch((error) => {
            //               console.log(error)
            //               fnSendDataStructureError(msgError)
            //             })
            //         }
            //       )
            // Adiciona o promise à lista da espera
            promises.push(promise)
          }

          // Define a execução após a realização de todos os promises
          Promise.all(promises).then(
            (datasets) => {
              let fullDS: any = []
              for (const dataset of datasets) {
                fullDS = fullDS.concat(dataset)
              }
              if (structure.api_options) {
                fullDS = fnReformDataset(
                  fullDS,
                  structure.api_options,
                  customParams
                )
              }
              cbFunction(
                fullDS,
                structure.args,
                structure,
                addedParams
              )
            }
          ).catch((error) => {
            console.log(error)
            fnSendDataStructureError(msgError)
          })
        }
      } else if (addedParams && addedParams.react &&
        structure.api_reactive !== null && structure.api_reactive !== undefined) {
        // If the structure defines an API call, execute the
        // callback after the axios call.
        const fusionParams = Object.assign(customParams, addedParams.react)
        const url = textTransformService.applyInterpol(structure.api_reactive, {}, fusionParams)
        // replace comma (,) with \\, inside quotes
        // url = url.replace(/"([^"]*)+"/g, s => s.replace(/,/g, "\,"))
        $fetch(UrlTransformService.getApiUrl(url))
          .then((result: any) => {
            cbFunction(
              fnReformDataset(
                result.dataset,
                structure.api_reactive.options,
                customParams
              ),
              structure.args,
              structure,
              addedParams,
              result.metadata
            )
          }).catch((error) => {
            console.log(error)
            fnSendDataStructureError(msgError)
          })
      } else if (structure.fixed !== null && structure.fixed !== undefined) {
        // Apply callback on fixed value
        cbFunction(structure.fixed, structure.args, structure, addedParams)
      } else if (structure.function) {
        // Runs function with args defines in yaml structure
        cbFunction(
          objectTransformService.runNamedFunction(
            structure, null
          ),
          structure.args,
          structure,
          addedParams
        )
      } else if (structure.preloaded) {
        // If the structure defines the usage of preloaded indicators.
        if (structure.preloaded.function === "slice") {
          cbFunction(
            fnReformDataset(
              indicators.slice(
                structure.preloaded,
                customParams && customParams[structure.preloaded.prop] ? customParams[structure.preloaded.prop] : indicators.getGlobalDatasets()[structure.preloaded.prop].ds
              ),
              structure.preloaded.options
            ),
            structure.args,
            structure,
            addedParams
          )
        } else {
          cbFunction(
            fnReformDataset(
              (this as any)[structure.preloaded.function](
                structure.preloaded,
                customParams && customParams[structure.preloaded.prop] ? customParams[structure.preloaded.prop] : indicators.getGlobalDatasets()[structure.preloaded.prop].ds,
                Object.assign({}, customParams)
              ),
              structure.preloaded.options
            ),
            structure.args,
            structure,
            addedParams
          )
        }
      } else if (structure.api !== null && structure.api !== undefined) {
        if (!Array.isArray(structure.api)) {
          // If the structure defines a single API call, execute the
          // callback after the axios call.
          const url = textTransformService.applyInterpol(structure.api, {}, customParams)
          $fetch(UrlTransformService.getApiUrl(url))
            .then((result: any) => {
              let dataset = fnReformDataset(
                result.dataset,
                structure.api.options,
                customParams
              )
              if (structure.api_options) {
                dataset = fnReformDataset(
                  dataset,
                  structure.api_options,
                  customParams
                )
              }
              cbFunction(
                dataset,
                structure.args,
                structure,
                addedParams,
                result.metadata
              )
            }).catch((error) => {
              console.log(error)
              fnSendDataStructureError(msgError)
            })
        } else {
          // If the structure defines a single API call, execute the
          // callback after all the axios calls are resolved.
          const promises: Promise<any>[] = []
          for (const eachApi of structure.api) {
            // Cria um promise
            const promise = $fetch(UrlTransformService.getApiUrl(textTransformService.applyInterpol(eachApi, {}, customParams)))
              .then((result:any) => {
                return fnReformDataset(
                  result.dataset,
                  eachApi.options,
                  customParams
                )
              }).catch((error) => {
                console.log(error)
                fnSendDataStructureError(msgError)
              })
            // Adiciona o promise à lista da espera
            promises.push(promise)
          }

          // Define a execução após a realização de todos os promises
          Promise.all(promises).then(
            (datasets) => {
              let fullDS: any = []
              for (const dataset of datasets) {
                fullDS = fullDS.concat(dataset)
              }
              if (structure.api_options) {
                fullDS = fnReformDataset(
                  fullDS,
                  structure.api_options,
                  customParams
                )
              }
              cbFunction(
                fullDS,
                structure.args,
                structure,
                addedParams
              )
            }
          ).catch((error) => {
            console.log(error)
            fnSendDataStructureError(msgError)
          })
        }
      } else if (structure.chart_data) { // Estrutura obtida de uma chamada de API
        cbFunction(
          fnReformDataset(
            structure.chart_data.dataset,
            structure.reform_options,
            customParams
          ),
          structure.args,
          structure,
          addedParams,
          structure.chart_data.metadata
        )
      } else {
        // Apply callback without data
        cbFunction(structure.fixed, structure.args, structure, addedParams)
      }
    }
  }

  const reformDataset = (dataset: any, reformOptions: any, customParams: any = {}): Record<string, any> => {
    if (reformOptions) {
      // Adiciona o mínimo e o máximo ao dataset
      if (reformOptions.recalc_min_max) {
        const minmax_field = (reformOptions.minmax_field) ? reformOptions.minmax_field : "vl_indicador"
        dataset = indicators.getMinMaxEachIndicator(dataset, minmax_field)
      }

      // Adiciona o total de um campo a todas as linhas do dataset
      if (reformOptions.recalc_sum) {
        const sum_field = (reformOptions.recalc_sum.sum_field) ? reformOptions.recalc_sum.sum_field : "vl_indicador"
        let sum = 0
        for (const eachRow of dataset) {
          sum += eachRow[sum_field]
        }
        const nuField = "sum_" + sum_field
        for (const eachRow of dataset) {
          eachRow[nuField] = sum
        }
      }

      if (reformOptions.combine) {
        dataset = dataset.concat(indicators.combineIndicators(dataset, reformOptions.combine, reformOptions.place_id_field))

        // Faz um slice, se declarado
        if (reformOptions.slice) {
          dataset = indicators.slice(reformOptions.slice, dataset)
        }
      }

      // Melts the dataset (ruws to columns)
      if (reformOptions.melt) {
        dataset = indicators.melt(
          dataset,
          reformOptions.melt.value_field,
          reformOptions.melt.layer_fields,
          reformOptions.melt.layer_field,
          reformOptions.melt.label_fields,
          reformOptions.melt.label_field,
          reformOptions.melt.value_function
        )
      }

      if (reformOptions.cast) {
        dataset = indicators.cast(
          dataset,
          reformOptions.cast.col_fields,
          reformOptions.cast.value_field ? reformOptions.cast.value_field : "vl_indicador",
          reformOptions.cast.layer_field ? reformOptions.cast.layer_field : "cd_indicador"
        ).dataset
      }

      for (const indx in reformOptions.calcs) {
        const nuField = "calc_" + reformOptions.calcs[indx].id
        for (const eachRow in dataset) {
          if (reformOptions.calcs[indx].function) {
            dataset[eachRow][nuField] = objectTransformService.runNamedFunction(
              reformOptions.calcs[indx], dataset[eachRow],
              [dataset[eachRow]], customParams)
          }

          if (reformOptions.calcs[indx].format) {
            dataset[eachRow][nuField] = numberTransformService.formatNumber(
              dataset[eachRow][nuField], reformOptions.calcs[indx].format,
              reformOptions.calcs[indx].precision, reformOptions.calcs[indx].multiplier,
              reformOptions.calcs[indx].collapse, reformOptions.calcs[indx].signed,
              reformOptions.calcs[indx].uiTags
            )
          }
        }

        // Adiciona o mínimo e o máximo ao dataset
        if (reformOptions.calcs[indx].recalc_min_max) {
          dataset = indicators.getMinMaxEachIndicator(dataset, nuField)
        }
      }

      for (const indxClone in reformOptions.clone) {
        dataset.map((reg: any) => {
          reg[reformOptions.clone[indxClone].new_column] = reg[reformOptions.clone[indxClone].id]
          return reg
        })
      }

      for (const indxFmts in reformOptions.formatters) {
        const nuField = "fmt_" + reformOptions.formatters[indxFmts].id
        let formatRules = reformOptions.formatters[indxFmts]
        for (const eachRow in dataset) {
          if (formatRules.format == "auto") {
            formatRules = textTransformService.getFormatRules(formatRules, dataset[eachRow])
          }
          dataset[eachRow][nuField] = numberTransformService.formatNumber(
            dataset[eachRow][reformOptions.formatters[indxFmts].id],
            formatRules.format,
            formatRules.precision,
            formatRules.multiplier,
            formatRules.collapse,
            formatRules.signed,
            formatRules.uiTags,
            formatRules.null_value
          )
        }

        // Adiciona o mínimo e o máximo ao dataset
        if (reformOptions.formatters[indxFmts].recalc_min_max) {
          dataset = indicators.getMinMaxEachIndicator(dataset, nuField)
        }
      }

      if (reformOptions.order_field !== null && reformOptions.order_field !== undefined) {
        let order_field = reformOptions.order_field
        let order = "asc"
        if (order_field.substring(0, 1) === "-") {
          order = "desc"
          order_field = order_field.substring(1)
        }
        dataset = indicators.sortObject(dataset, order_field, order)
      }
    }

    return dataset
  }

  const autoFillLayout = (base_object_list: any, rules: any, _preloaded: any, addedParams: any = null, _metadata: any = null) =>{
    if (base_object_list && base_object_list.length > 0) {
      const base_object = base_object_list[0]
      for (const ruleIndx in rules) {
        let prop = ""
        if (rules[ruleIndx].fixed) {
          prop = rules[ruleIndx].fixed
        } else if (rules[ruleIndx].named_prop) {
          prop = base_object[rules[ruleIndx].named_prop]
        } else if (rules[ruleIndx].function) {
          prop = objectTransformService.runNamedFunction(rules[ruleIndx], base_object)
        }

        if ((prop === null || prop === undefined) && rules[ruleIndx].default) {
          prop = rules[ruleIndx].default
        } else if (rules[ruleIndx].format !== null && rules[ruleIndx].format !== undefined) {
          let formatRules = rules[ruleIndx]
          if (rules[ruleIndx].format == "auto") {
            formatRules = textTransformService.getFormatRules(rules[ruleIndx], base_object)
          }
          prop = numberTransformService.formatNumber(
            prop, formatRules.format, formatRules.precision,
            formatRules.multiplier, formatRules.collapse, formatRules.signed,
            formatRules.uiTags
          ) as string
        }

        if (addedParams && addedParams.innerProp) {
          (this as any)[addedParams.innerProp][rules[ruleIndx].prop] = prop
        } else {
          (this as any)[rules[ruleIndx].prop] = prop
        }
      }
    }
  }

  // getApiUrl (scope: string, thematic: boolean = false, added_filters: any = null, agregacao: string | null = null) {
  //   let url = "/"
  //   const obsAtual = this.$observatories.identifyObservatory(this.$route.path.split("/")[1])
  //   if (thematic && obsAtual && obsAtual != "td") {
  //     url += obsAtual + "/"
  //   }

  //   const resource = this.getResourceParamsFromScope(scope)
  //   url += (resource ? resource.res : "indicadoresmunicipais")

  //   url += "?categorias=" + (resource ? resource.cats : "cd_mun_ibge,nm_municipio,ds_indicador,cd_indicador,nu_competencia,ds_fonte,media_uf,rank_uf,rank_br")

  //   if (agregacao) {
  //     url += "&valor=vl_indicador&agregacao=" + agregacao
  //   } else {
  //     url += ",vl_indicador"
  //   }

  //   const filters = this.getFiltersfFromRoute()
  //   url += "&filtros=" + (filters || "eq-cd_mun_ibge-") + this.getIdLocalidadeFromRoute(this.$route.params.idLocalidade)

  //   if (added_filters && added_filters != "") {
  //     if (filters) {
  //       url += ",and,"
  //     }
  //     url += added_filters
  //   }
  //   return url
  // },

  // getResourceParamsFromScope (scope: string | null = null) {
  //   if (scope == null || scope == "") { scope = this.getEscopo(this.$route.params.idLocalidade) }
  //   switch (scope) {
  //     case "municipio":
  //       return {
  //         res: "indicadoresmunicipais",
  //         cats: "cd_mun_ibge,nm_municipio,ds_indicador,cd_indicador,nu_competencia,ds_fonte,media_uf,rank_uf,rank_br"
  //       }
  //     case "uf":
  //       return {
  //         res: "indicadoresestaduais",
  //         cats: "cd_mun_ibge,ds_indicador,cd_indicador,nu_competencia,ds_fonte,rank_br"
  //       }
  //     case "br":
  //       return {
  //         res: "indicadoresnacionais",
  //         cats: "cd_mun_ibge,ds_indicador,cd_indicador,nu_competencia,ds_fonte"
  //       }
  //   }
  //   return null
  // },

  // getFiltersfFromRoute () {
  //   const reach = this.getEscopo(this.$route.params.idLocalidade)

  //   switch (reach) {
  //     case "brasil":
  //       return null
  //     case "prtptm":
  //       return "eq-cd_unidade-"
  //     case "estado":
  //       return "eq-cd_uf-"
  //     default:
  //       return "eq-cd_mun_ibge-"
  //   }
  // },

  const getIdLocalidadeFromRoute =  (idLocalidade: string) => {
    if (idLocalidade == "0") { return "0" } // Brasil
    if (idLocalidade.includes("mptreg") || idLocalidade.includes("MPTREG")) {
      return idLocalidade.substring(6)
    }
    if (idLocalidade.includes("prt") || idLocalidade.includes("PRT") ||
      idLocalidade.includes("ptm") || idLocalidade.includes("PTM")) {
      return idLocalidade.substring(3)
    }
    return idLocalidade
  }

  const setDataset = (dataset: any, rules: any, structure: any, addedParams: any, metadata: any) => {
    let options = structure.chart_options
    if (options === null || options === undefined) {
      options = structure.options
    }

    // for (const eachRow in dataset) {
    //   if (options.pct_field !== null && options.pct_field !== undefined) {
    //     dataset[eachRow].pct_indicador = dataset[eachRow][options.pct_field]
    //   }
    //   if (structure.chart_type == "TREEMAP" && options.format_function !== null && options.format_function !== undefined) {
    //     if (this.customFunctions && this.customFunctions[options.format_function]) {
    //       dataset[eachRow][options.id] = this.customFunctions[options.format_function](dataset[eachRow], options)
    //     } else {
    //       dataset[eachRow][options.id] = this[options.format_function](dataset[eachRow], options)
    //     }
    //   }
    // }

    if (options.order_field !== null && options.order_field !== undefined) {
      let order_field = options.order_field
      let order = "asc"
      if (order_field.substring(0, 1) === "-") {
        order = "desc"
        order_field = order_field.substring(1)
      }
      dataset = indicators.sortObject(dataset, order_field, order)
    }

    const _this = (this as any)
    if (addedParams && addedParams.id) {
      // Mixed_map
      if (_this.dataset == null) {
        _this.dataset = []
        _this.metadata = []
      }
      // Múltiplos gráficos ou mixed_map
      _this.dataset[addedParams.id] = dataset
      _this.metadata[addedParams.id] = metadata
      _this.triggerChartUpdates(addedParams.id, dataset, metadata)
      _this.datasetsComplete++
    } else if (addedParams && addedParams.props) {
      if (addedParams.props.dataset) { _this[addedParams.props.dataset] = dataset }
      if (addedParams.props.metadata) { _this[addedParams.props.metadata] = metadata }
    } else {
      // Dataset único
      _this.dataset = dataset
      _this.metadata = metadata
    }

    if (addedParams && addedParams.fnCallback) {
      addedParams.fnCallback()
    }
  }

  return {
    provide: {
      sendDataStructureError,
      loadYamlArray,
      fillDataStructure,
      reformDataset,
      autoFillLayout,
      getIdLocalidadeFromRoute,
      setDataset
    }
  }
})

