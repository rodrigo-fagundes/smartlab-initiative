<template>
  <v-row class="pt-0">
    <v-col
      xs="12"
      :style="`background-color: ${bgColor || 'black'}; color: ${titleFontColor || 'white'}`"
    >
      <v-row
        class="pt-0 py-3"
        align="start"
        justify="center"
      >
        <v-col
          v-for="(odometer, odoIndex) in odometerItems"
          :key="'odo_'+odoIndex"
          :xs="getColSize('xs',odometer.cls) || 12"
          :sm="getColSize('sm',odometer.cls)"
          :md="getColSize('md',odometer.cls)"
          :lg="getColSize('lg',odometer.cls)"
          :xl="getColSize('xl',odometer.cls)"
          class="px-2 py-2"
        >
          <v-row align="start" justify="center" class="fill-height">
            <v-col xs="12" class="pa-0 odometer-title caption text-xs-center">
              <div :id="'odm_' + odometer.id" :ref="odometer.id" :class="odometer.options.cls_format || ''" v-html="numberTransformService.formatNumber(dtOdometros.find((odom: OdometerDataItem) => odom.cd_indicador == odometer.id_odometer)?.vl_estimado, odometer.options.cls_format || 'inteiro')" >
              </div>
              <div v-html="odometer.title || ''"></div>
              <div v-if="odometer.show_pace && dtOdometros.length > 0" xs="12" class="pa-0 odometer-title caption text-xs-center">
              {{ odometer.pace_description || '' }}
              {{ numberTransformService.getPaceString((dtOdometros.find((odom: OdometerDataItem) => odom.cd_indicador == odometer.id_odometer) as OdometerDataItem).delta_por_ms || 0, true) }}
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <v-row>
    <v-col class="py-3 px-0 title-obs">
      {{ commentTitle || '' }}
    </v-col>
    <v-col v-if="commentItems.length === odometerItems.length" xs="12" class="pb-2">
      <div
        v-for="(comment, commentIndex) in commentItems"
        :key="'comment_' + commentIndex"
        v-html="`${commentIndex + 1}. ${comment}`"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
// import Odometer from "odometer"
// import "odometer/themes/odometer-theme-car.css"
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue"
import { NumberTransformService } from "~/utils/service/singleton/numberTransform"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
const textTransformService = new TextTransformService()
const numberTransformService = new NumberTransformService()

export default defineComponent({
  props: {
    odometerItems: {
      type: Array as () => OdometerItem[],
      required: true
    },
    commentTitle: {
      type: String,
      default: ""
    },
    bgColor: {
      type: String,
      default: "black"
    },
    titleFontColor: {
      type: String,
      default: "white"
    }
  },
  setup(props, { emit }) {
    const commentItems = ref<string[]>([])
    const commentData = ref<string>("")
    const dtOdometros = ref<OdometerDataItem[]>([])
    const { $getColSize } = useNuxtApp()
    const startCounter = (id: string, options: any, comment = "") => {
      if (comment) {
        buildCommentData(comment, options)
      }

      let start = options.start
      if (options.offset) {
        start += options.offset
      }

      // let element = props.odometerItems.find(item => item.id === id)?.ref
      // if (Array.isArray(element)) {
      //   element = element[0]
      // }
      // const odometer = new Odometer({
      //   el: element,
      //   theme: options.theme || 'car',
      //   format: options.format || '(.ddd)',
      //   animation: options.animation || 'count',
      //   value: start
      // })
      // odometer.render()
      // odometer.value_float = start
      // setInterval(updateOdometer, 5000, odometer, options)
    }

    const updateOdometer = (odometer: any, options: any) => {
      odometer.value_float += options.pace * (options.updateRate || 5000)
      odometer.update(Math.trunc(odometer.value_float))
    }

    const buildCommentData = (comment: any, options: any) => {
      commentData.value = ""
      if (comment.fixed !== undefined) {
        if (comment.format) {
          commentData.value = numberTransformService.formatNumber(comment.fixed, comment.format, comment.precision, comment.multiplier, comment.collapse, comment.signed, comment.uiTags)
        } else {
          commentData.value = comment.fixed
        }
      } else if (comment.template !== undefined) { // caso o campo tenha um texto fixo, o valor é ajustado e o loop segue para a próxima iteração
        super.setComplexAttribute(options, [comment], comment, { attribute: "commentData", attribRefs: {commentData: commentData} })
      }
      commentItems.value.push(commentData.value)
    }

    onMounted(async () => {
      const result: any = await $fetch(UrlTransformService.getApiUrl("/odometros/sst"))
      const data = JSON.parse(result)
      dtOdometros.value = data

      if (dtOdometros.value){
        props.odometerItems.forEach((odometer: any) => {
          const curOdometro: OdometerDataItem = dtOdometros.value.find((odom: OdometerDataItem) => odom.cd_indicador == odometer.id_odometer) as OdometerDataItem
          odometer.title = textTransformService.applyInterpol(
            odometer.title,
            {},
            curOdometro,
            null)

          const options = { ...odometer.options }
          options.start = curOdometro.vl_estimado
          options.pace = curOdometro.delta_por_ms
          startCounter(odometer.id, options)
        })
      }

      // props.odometerItems.forEach((odometer: any) => {
      //   if (odometer.api) {
      //     $fetch(UrlTransformService.getApiUrl(odometer.api.fixed)).then((result: any) => {
      //       const tickerData = JSON.parse(result.data).dataset[0]
      //       const options = { ...odometer.options }

      //       options.val_prop = tickerData[options.count_prop] || tickerData[options.val_prop]

      //       startCounter(odometer.id, options, odometer.comment)
      //     })
      //   }
      // })
    })

    onBeforeUnmount(() => {
      // clearInterval(updateOdometer)
    })

    return {
      commentItems,
      commentData,
      dtOdometros,
      startCounter,
      updateOdometer,
      numberTransformService,
      getColSize: $getColSize
    }
  }
})
</script>

<style>
  /* @import "odometer/themes/odometer-theme-car.css"; */

  .odometer {
    font-size: 1.5rem;
    font-weight: normal;
  }

  .monetario .odometer-inside:before {
    content: "R$";
  }

  .odometer .odometer-inside:before {
    display: inline-block;
    vertical-align: sup;
    opacity: .6;
    font-size: .85rem;
    margin-right: .12em;
  }

  .odometer-title {
    color: #eee0d3 !important;
  }

</style>
