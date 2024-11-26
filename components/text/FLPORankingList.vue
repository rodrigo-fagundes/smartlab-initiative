<template>
  <v-col :class="cls"
    cols="12"
    :xs="getColSize('xs',cls) || 12"
    :sm="getColSize('sm',cls)"
    :md="getColSize('md',cls)"
    :lg="getColSize('lg',cls)"
    :xl="getColSize('xl',cls)"
  >
    <v-row v-if="structure?.look !== 'minicard'" class="ml-2 mb-2" wrap>
      <v-col cols="12" class="display-1-obs ranking-list-title pb-2" ><span v-html="title"></span></v-col>
      <v-col v-if="errorMessage" cols="12" class="display-1-obs ranking-list-text pb-2">
        {{ errorMessage }}
      </v-col>
      <v-col
        v-for="(item, itemIndx) in ranking"
        :key="itemIndx"
        cols="12"
        class="ranking-list pa-0"
      >
        <div :class="`text-left ranking-list-text ${structure?.text_size ? '-' + structure.text_size : ''}`" v-html="`<span>${item.rank ? item.rank : itemIndx + 1}. </span> ${item.localidade} ${item.vl_indicador ? item.vl_indicador : ''}`" />
      </v-col>
    </v-row>
    <v-row
      v-else
      class="ml-2 mb-2 ranking-list-minicard"
      wrap
    >
      <v-col v-if="errorMessage" cols="12" class="display-1-obs ranking-list-minicard-text pb-2">
        {{ errorMessage }}
      </v-col>
      <v-col
        v-for="(item, itemIndx) in ranking"
        :key="itemIndx"
        cols="12"
        class="ranking-list-minicard pa-0"
      >
        <div :class="`ranking-list-minicard-text ${structure.text_size ? '-' + structure.text_size : ''}`" v-html="`${item.rank ? item.rank : itemIndx + 1}. ${item.localidade} ${item.vl_indicador ? item.vl_indicador : ''}`" />
      </v-col>
      <v-col cols="12" class="ranking-list-minicard-title pb-2" ><span v-html="title"></span></v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue"
import { NumberTransformService } from "~/utils/service/singleton/numberTransform"
const numberTransformService = new NumberTransformService()

export default defineComponent({
  props: {
    id: String,
    structure: Object,
    customParams: Object,
    reactiveFilter: [String, Number, Object],
    customFilters: Object
  },
  setup(props) {
    const ranking = ref<any[]>([])
    const cls = ref<string>(props.structure?.cls || "xs12")
    const title = ref<string | null>(props.structure?.title || null)
    const errorMessage = ref<string | null>(null)
    const { $fillDataStructure, $getColSize } = useNuxtApp()


    const fillRankingList = (base_object_list: any, rules: any, _preloaded: any, _addedParams: any = null, _metadata: any = null) => {
      const tempRanking: any[] = []
      base_object_list.forEach((item: any, itemIndex: number) => {
        const rankingItem: any = {}
        rules.forEach((rule: any) => {
          let value = item[rule.named_prop]
          if (value !== null && value !== undefined && rule.format) {
            value = numberTransformService.formatNumber(
              value, rule.format, rule.precision, rule.multiplier, rule.collapse, rule.signed, rule.uiTags
            )
          }
          rankingItem[rule.prop] = value
        })
        tempRanking[itemIndex] = rankingItem
      })
      ranking.value = tempRanking
    }

    const updateReactiveDataStructure = (filterUrl: string) => {
      const structReactive = { ...props.structure }
      structReactive.api = JSON.parse(JSON.stringify(props.structure?.apiBase || props.structure?.api))

      if (structReactive.api) {
        if (!Array.isArray(structReactive.api)) {
          structReactive.api = [structReactive.api]
        }
        structReactive.api.forEach((struct: any) => {
          if (struct.fixed) {
            struct.fixed += filterUrl
          } else if (struct.template) {
            struct.template += filterUrl
          }
        })
      }

      $fillDataStructure(
        structReactive, props.customParams, fillRankingList
      )
    }

    watch(
      () => props.reactiveFilter,
      (newVal, oldVal) => {
        if (newVal !== oldVal && props.structure?.reactive) {
          errorMessage.value = null
          ranking.value = []
          updateReactiveDataStructure(props.customFilters?.filterUrl)
        }
      }
    )

    onMounted(() => {
      if (props.structure?.cls) {
        cls.value = props.structure.cls
      }
      if (props.structure?.title) {
        title.value = props.structure.title
      }

      $fillDataStructure(
        props.structure, props.customParams, fillRankingList
      )
    })

    return {
      cls,
      title,
      errorMessage,
      ranking,
      getColSize: $getColSize
    }
  }
})
</script>

<style scoped>
.ranking-list {
  display: inline-block !important;
}

.ranking-list-text span {
  font-size: 0.85rem;
}

.ranking-list-text {
  font-size: 1rem;
}

.ranking-list-title {
  text-transform: uppercase;
  font-size: 1.25rem;
}

.ranking-list-minicard {
  color: rgb(53, 94, 168, 1);
}

.ranking-list-minicard-text {
  font-family: Lato, Calibri, sans-serif !important;
  font-size: 1.25rem;
  line-height: 1.2;
}

.ranking-list-minicard-title {
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 400;
}
</style>
