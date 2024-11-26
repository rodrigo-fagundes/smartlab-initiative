<template>
  <v-col>
    <v-autocomplete
      v-model="chosen"
      :items="items"
      :filter="ignoreSpecialCharFilter"
      :variant="isOutline ? 'outlined' : 'filled'"
      :label="structure?.label"
      item-text="label"
      :placeholder="structure?.placeholder"
      item-value="id"
      class="input-group--focused"
      return-object
      :color="structure?.color || 'primary'"
      :multiple="structure?.multiple || false"
      :clearable="structure?.clearable ?? true"
      :hint="errorMessage"
      persistent-hint
      @update:model-value="sendSelection"
    />
  </v-col>
</template>


<script lang="ts">
import { defineComponent, ref } from "vue"
import { useEmitter } from "~/composables/useEmitter"
import { TextTransformService } from "~/utils/service/singleton/textTransform"

const textTransformService = new TextTransformService()

export default defineComponent({
  props: {
    id: String,
    structure: Object,
    customParams: Object,
    immediate: {
      type: Boolean,
      default: true
    },
    reactiveFilter: Object,
    reactiveParent: String,
    isOutline: Boolean
  },
  setup(props, { emit }) {
    const { toItem } = useEmitter(props, emit)
    const label = ref<string | null>(null)
    const color = ref("primary")
    const chosen = ref<any>(null)
    const items = ref<any[]>([])
    const errorMessage = ref<string | undefined>(undefined)

    const toItems = (dataset: any, rules: any, _preloaded: any, _addedParams: any = null, _metadata: any = null)  => {
      items.value = []
      dataset.forEach((row: any) => toItem(row, rules))

      // Seleciona o valor default, se houver
      if (props.structure?.default) {
        let defaultValue = null

        if (props.structure.default.fixed != null) {
          defaultValue = props.structure.default.fixed
        } else if (props.structure.default.base_object && props.customParams && props.customParams[props.structure.default.base_object]) {
          defaultValue = props.customParams[props.structure.default.base_object][props.structure.default.named_prop]
        } else if (props.customParams){
          defaultValue = props.customParams[props.structure.default.named_prop]
        }

        chosen.value = items.value.find(item => item.id === defaultValue) || null
      } else if (!props.structure?.clearable) {
        chosen.value = items.value[0] || null
      } else {
        chosen.value = null
      }

      if (chosen.value != null) {
        sendDefaultSelection()
      }
    }

    const ignoreSpecialCharFilter = (item: any, queryText: string, itemText: string): boolean => {
      queryText = textTransformService.replaceSpecialCharacters(queryText).toLowerCase()
      itemText = textTransformService.replaceSpecialCharacters(itemText).toLowerCase()
      return itemText.includes(queryText)
    }

    const sendSelection = () => {
      emit("change", chosen.value)
    }

    const sendDefaultSelection = () => {
      emit("default-selection", chosen.value)
    }

    return {
      label,
      color,
      chosen,
      items,
      errorMessage,
      ignoreSpecialCharFilter,
      toItems,
      sendSelection
    }
  }
})
</script>
