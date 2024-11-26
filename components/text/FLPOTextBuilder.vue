<template>
  <v-row :class="structure && structure.cls ? structure.cls : 'ma-0 pa-2'"
  >
    <v-col>
      <v-row v-if="structure?.columns" class="pa-2">
        <v-col v-if="readMoreLimit && !maxedOut" class="d-flex flex-column pl-0 py-0 pb-0 body-obs">
          <div
            v-if="collapsed"
            :class="'d-inline-block text-left ' + (structure.cls ? structure.cls : '')"
            :style="mdAndUp ? 'column-gap: 4rem; column-count: ' + structure.columns : ''"
            v-html="finalShortText"
          ></div>
          <div
            v-else
            :class="'d-inline-block text-left ' + (structure.cls ? structure.cls : '')"
            :style="mdAndUp ? 'column-gap: 4rem; column-count: ' + structure.columns : ''"
            v-html="finalText"
          ></div>
          <v-btn variant="text" color="accent" class="read-more-less text-left" @click="toggleCollapseExpand()">
            <span v-html="cmpTextMoreLess"></span>
            <v-icon :class="assessMoreLess">mdi-chevron-down</v-icon>
          </v-btn>
        </v-col>

        <v-col v-else :class="'body-obs text-left d-inline-block ' + (structure.cls ? structure.cls : 'pl-2 py-0 pb-3')">
          <div
            :style="mdAndUp ? 'column-gap: 4rem; column-count: ' + structure.columns : ''"
            v-html="finalText"
          ></div>
        </v-col>
      </v-row>

      <v-row v-else class="pa-2">
        <v-col v-if="readMoreLimit && !maxedOut" class="d-flex flex-column pl-0 py-0 pb-0 body-obs">
          <span
            v-if="collapsed"
            :class="'d-inline-block text-left ' + (structure?.cls ? structure.cls : '')"
            v-html="finalShortText"
          ></span>
          <span
            v-else
            :class="'d-inline-block text-left ' + (structure?.cls ? structure.cls : '')"
            v-html="finalText"
          ></span>
          <v-btn variant="text" color="accent" class="read-more-less text-left" @click="toggleCollapseExpand()">
            <span v-html="cmpTextMoreLess"></span>
            <v-icon :class="assessMoreLess">mdi-chevron-down</v-icon>
          </v-btn>
        </v-col>

        <v-col v-else :class="'d-inline-block body-obs text-left ' + (structure?.cls ? structure.cls : 'pl-2 py-0 pb-3')">
          <span v-html="finalText"></span>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from "vue"
import { useDisplay } from "vuetify"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { Indicators } from "~/utils/model/indicators"

const textTransformService = new TextTransformService()
const indicators = new Indicators()

export default defineComponent({
  props: {
    structure: Object,
    customParams: Object,
    readMoreLimit: String,
    reactiveFilter: Object,
  },
  setup(props) {
    const { mdAndUp } = useDisplay()
    const { $fillDataStructure } = useNuxtApp()

    const finalText = ref("")
    const finalShortText = ref("")
    const collapsed = ref(true)
    const maxedOut = ref(false)

    
    const cmpTextMoreLess = computed(() => (collapsed.value ? "Leia mais" : "Leia menos"))
    const assessMoreLess = computed(() => (collapsed.value ? "more" : "less"))

    watch(
      () => props.reactiveFilter,
      (newVal, oldVal) => {
        if (newVal !== oldVal && props.structure?.reactive) {
          $fillDataStructure(
            props.structure,
            props.customParams,
            setTextContent,
            {
              react: newVal,
              msgError: "Falha ao carregar dados do componente texto"
            }
          )
        }
      }
    )

    onMounted(() => {
      $fillDataStructure(
        props.structure,
        props.customParams,
        setTextContent,
        { msgError: "Falha ao carregar dados do componente texto" }
      )
    })

    const toggleCollapseExpand = () => {
      collapsed.value = !collapsed.value
    }

    const buildShortText = (fullText: string) => {
      if (props.readMoreLimit) {
        if (fullText.length <= parseInt(String(props.readMoreLimit), 10)) {
          maxedOut.value = true
        } else {
          const endCharRegex = /[.,!?;& [:space:]](?!.*[.,!?;& [:space:]])/g
          endCharRegex.exec(fullText.substring(0, parseInt(String(props.readMoreLimit), 10)))
          finalShortText.value = finalText.value.substring(0, endCharRegex.lastIndex)
        }
      }
    }

    const setTextContent = (base_object_list: any, rules: any, structure: any, _metadata: any) => {
      if (typeof base_object_list === "string") {
        finalText.value = base_object_list
        buildShortText(base_object_list)
      } else {
        const finalTextValue =  textTransformService.replaceArgs(
          structure.template,
          indicators.indicatorsToValueArray(
            rules,
            base_object_list
          )
        )
        finalText.value = finalTextValue
        buildShortText(finalTextValue)
      }
    }

    return {
      finalText,
      finalShortText,
      collapsed,
      maxedOut,
      mdAndUp,
      cmpTextMoreLess,
      assessMoreLess,
      toggleCollapseExpand,
      setTextContent
    }
  }
})
</script>

<style>
.read-more-less {
  cursor: pointer;
}

.read-more-less .v-icon {
  transition: all 1s ease;
}

.read-more-less .v-icon.more {
  transform: rotate(0deg);
}

.read-more-less .v-icon.less {
  transform: rotate(180deg);
}
</style>
