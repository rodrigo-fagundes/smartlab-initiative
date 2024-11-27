<template>
  <v-col 
    cols="12"
    :class="`${rowClass ? rowClass : 'pl-4 pr-0 pb-3 pt-3'} ${cardClass}`"
    :xs="getColSize('xs',cardClass)"
    :sm="getColSize('sm',cardClass)"
    :md="getColSize('md',cardClass)"
    :lg="getColSize('lg',cardClass)"
    :xl="getColSize('xl',cardClass)"

  >
    <v-row
      :class="`minicard fill-height ${colorClass} ${relevance}`"
    >
      <v-col>
        <!-- Error Message -->
        <v-row>
          <v-col v-if="errorMessage" :class="`pa-0 minicard-comment ${commentColorClass}`">
            <span v-html="errorMessage"></span>
          </v-col>
        </v-row>

        <!-- Value -->
        <v-row>
          <v-col class="pa-0">
            <span class="minicard-value" v-html="value"></span>
          </v-col>
        </v-row>  

        <!-- Description -->
        <v-row>
          <v-col class="pa-0">
            <span class="title-obs-desc minicard-description" v-html="description ? description.toUpperCase() : ''"></span>
          </v-col>
        </v-row>  

        <!-- Chart -->
        <v-row>
          <v-col v-if="dataset?.length > 1 && structure?.chart" class="minicard-chart">
            <div
              v-if="structure.chart?.type && isValidChart(structure.chart.type)"
              :id="chartId"
              ref="chart"
              :class="isLeafletBasedCharts(structure.chart.type) ? 'map_geo' : ''"
              class="fill-height"
            />
          </v-col>
        </v-row>

        <!-- Comment -->
        <v-row>
          <v-col class="pa-0">
            <span :class="`minicard-comment ${commentColorClass}`" v-html="comment"></span>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onBeforeMount } from "vue"
import { useNuxtApp } from "#app"
import { TextTransformService } from "@/utils/service/singleton/textTransform"
import { NumberTransformService } from "@/utils/service/singleton/numberTransform"
import { Indicators } from "@/utils/model/indicators"
import { useBaseLayout } from "@/composables/useBaseLayout"

const textTransformService = new TextTransformService()
const numberTransformService = new NumberTransformService()
const indicators = new Indicators()

export default defineComponent({
  props: {
    structure: Object,
    customParams: Object,
    topology: Object,
    sectionIndex: Number,
    rowClass: String,
    reactiveFilter: [String, Object, Array],
    customFilters: Object
  },
  setup(props, { emit }) {
    const { setComplexAttribute } = useBaseLayout(
      props.customParams, 
      emit 
    )    
    const { $reformDataset, $fillDataStructure, $validCharts, $leafletBasedCharts, $chartGen, $getColSize } = useNuxtApp()
    const relevance = ref("")
    const description = ref("")
    const value = ref("")
    const comment = ref("")
    const cardClass = ref("")
    const colorClass = ref("")
    const commentColorClass = ref("")
    const dataset = ref<Record<string, any> | string | null>(null)
    const metadata = ref<Record<string, any> | null | undefined>(null)
    const errorMessage = ref<string | null>(null)
    const miniRefs: Record<string, Ref<any>>  = {"value": value, "description": description, "comment": comment}


    const chartId = computed(() => {
      return props.structure?.chart ? "chart_" + props.structure.chart.id : undefined
    })

    const isValidChart = (type: string): boolean => {
      return $validCharts.includes(type)
    }

    const isLeafletBasedCharts = (type:string): boolean => {
      return $leafletBasedCharts.includes(type)
    }

    const updateReactiveDataStructure = (filterUrl: string) => {
      let apiUrl = ""
      const namedProp = props.structure?.api_reactive.args[0]?.named_prop
      if (props.structure?.api_reactive && 
        props.customParams && 
        namedProp && 
        props.customParams[namedProp]) {
        apiUrl = textTransformService.applyInterpol(props.structure.api_reactive, props.customParams)
      } else {
        apiUrl = textTransformService.applyInterpol(props.structure?.apiBase ? props.structure.apiBase : props.structure?.api, props.customParams)
      }
      if (filterUrl) {
        apiUrl += filterUrl
      }
      $fetch(UrlTransformService.getApiUrl(apiUrl))
        .then((result: any) => {
          let datasetResult = $reformDataset(
            result.data.dataset,
            props.structure?.api.options,
            props.customParams
          )
          if (props.structure?.api_options) {
            datasetResult = $reformDataset(
              datasetResult,
              props.structure?.api_options,
              props.customParams
            )
          }
          if (props.structure){
            fillMinicard(
              datasetResult,
              props.structure.args,
              props.structure,
              undefined,
              result.data.metadata
            )
          }
        })
        .catch((_error) => {
          sendDataStructureError("Falha ao carregar dados do componente.")
        })
    }

    const triggerChartUpdates = () => {
      if (props.structure && props.structure.chart && props.structure.chart.options && props.structure.chart.type) {
        $chartGen(
          chartId.value,
          props.structure.chart.type,
          props.structure.chart,
          props.structure.chart.options,
          dataset.value,
          metadata.value,
          props.sectionIndex
        )
      }
    }

    const setDataset = (datasetValue: Record<string, any> | string, _rules: Record<string, any>, _structure:Record<string, any>, _addedParams?: Record<string, any> | string, metadataValue?: Record<string, any>) => {
      dataset.value = datasetValue
      metadata.value = metadataValue
      triggerChartUpdates()
    }

    const fillProp = (baseObjectList: Record<string, any> | string, args: Record<string, any>, _preloaded:Record<string, any>, addedParams?: Record<string, any> | string, _metadata?: Record<string, any>) => {
      if (typeof addedParams === "object" && addedParams !== null) {
        const rule = addedParams.rule
        if (rule.fixed !== undefined) {
          if (rule.format) {
            miniRefs[rule.prop].value = numberTransformService.formatNumber(rule.fixed, rule.format, rule.precision, rule.multiplier, rule.collapse, rule.signed, rule.uiTags)
          } else {
            miniRefs[rule.prop].value = rule.fixed
          }
        } else if (rule.template !== undefined) {
          setComplexAttribute(baseObjectList, [rule], rule, { attribute: rule.prop, attribRefs: miniRefs }, metadata)
        } else if (rule.id === undefined) {
          if (baseObjectList && typeof baseObjectList === "object" && baseObjectList.length > 0) {
            miniRefs[rule.prop].value = indicators.getAttributeFromIndicatorInstance(rule, baseObjectList[0])
          } else if (rule.default !== null && rule.default !== undefined) {
            miniRefs[rule.prop].value = rule.default
          } else {
            miniRefs[rule.prop].value = "Sem Registros"
          }
        } else {
          miniRefs[rule.prop].value = indicators.getIndicatorValueFromStructure(rule, baseObjectList)
        }
        
        if (rule.prop == "comment" && rule.color_changing) {
          let object = Array.isArray(baseObjectList) && baseObjectList.length > 0 ? baseObjectList[0] : baseObjectList || {}
          const baseValue = rule.color_changing.base_value_prop ? object[rule.color_changing.base_value_prop] : 0
          const comparedValue = object[rule.color_changing.compared_value_prop]
          const greaterThanColor: "red"|"green"|"blue" = rule.color_changing.gt_color || "green"
          const lowerThanColor: "red"|"green"|"blue" = rule.color_changing.lt_color || "red"
          const equalColor: "red"|"green"|"blue" = rule.color_changing.eq_color || "blue"
          const colors = {
            red: "red--text darken-1",
            green: "green--text darken-4",
            blue: "indigo--text darken-3"
          }
          commentColorClass.value = comparedValue > baseValue ? colors[greaterThanColor] : comparedValue == baseValue ? colors[equalColor] : colors[lowerThanColor]
        }
      }
    }

    const fillMinicard = (baseObjectList: Record<string, any> | string, rules: Record<string, any>, preloaded:Record<string, any>, addedParams?: Record<string, any> | string, _metadata?: Record<string, any>) => {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]
        if (rule.api) {
          $fillDataStructure(
            rule, props.customParams,
            fillProp,
            { rule }
          )
          continue
        }
        if (addedParams && typeof addedParams === "object") {
          addedParams.rule = rule
        } else {
          addedParams = { rule }
        }

        fillProp(baseObjectList, rule.args, preloaded, addedParams, metadata)
      }
    }

    const sendDataStructureError = (message: string) => {
      errorMessage.value = message
    }

    onBeforeMount(() => {
      relevance.value = props.structure?.relevance
      if (props.structure?.cls) cardClass.value = props.structure.cls
      if (props.structure?.color) colorClass.value = " bg-" + props.structure.color
      $fillDataStructure(
        props.structure, 
        props.customParams,
        fillMinicard
      )
      if (props.structure?.chart) {
        $fillDataStructure(
          props.structure.chart, props.customParams,
          setDataset
        )
      }
    })

    watch(() => props.reactiveFilter, (newVal, oldVal) => {
      if (newVal != oldVal) {
        errorMessage.value = null
        if (props.structure?.reactive) {
          value.value = ""
          updateReactiveDataStructure(props.customFilters?.filterUrl)
        } else if (props.structure?.api_reactive) {
          $fillDataStructure(
            props.structure, props.customParams,
            fillMinicard,
            { react: newVal }
          )
          if (props.structure.chart) {
            $fillDataStructure(
              props.structure.chart, props.customParams,
              setDataset,
              { react: newVal }
            )
          }
        }
      }
    })

    return {
      relevance,
      description,
      value,
      comment,
      cardClass,
      colorClass,
      commentColorClass,
      dataset,
      metadata,
      errorMessage,
      chartId,
      isValidChart,
      isLeafletBasedCharts,
      getColSize: $getColSize
    }
  }
})
</script>
<style>
  .minicard {
    color: rgb(53,94,168,1);
  }
  .red.minicard, .light-blue.minicard, .green.minicard, .orange.minicard, .minicard.lead {
    color: white !important;
  }
  .minicard-chart {
    height: 50px;
  }
  .minicard-value {
    font-family: Lato, Calibri, sans-serif !important;
    font-weight: 300;
    font-size: 2.2rem;
    line-height: 2rem;
  }
  .minicard-value span {
    text-transform: uppercase;
    font-size: 1.2rem;
    line-height: 0;
  }
  .minicard .minicard-description {
    font-size: 0.8rem;
    font-weight: 400;
  }
  .minicard .minicard-comment {
    font-size: 0.857rem;
    font-weight: 200;
  }
  .minicard-comment span {
    text-transform: uppercase;
    line-height: 0;
  }

  .minicard.low {
    color: rgb(1,1,1,0.87);
  }

  .minicard.low .minicard-value {
    font-size:2.2rem;
  }

  .minicard.low .minicard-description {
    font-size: 0.8rem;
    line-height: 1rem;
    font-weight: 400;
  }

  .minicard.low .minicard-comment {
    font-size: 0.857rem;
  }

  .minicard .minicard-comment {
    color: rgb(239,97,69,1);
  }

  .minicard.lead .minicard-comment {
    color: white;
  }

  .minicard.lead {
    margin-top: 8px !important;
  }

</style>
