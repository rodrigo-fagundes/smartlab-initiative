<template>
  <v-row class="py-0">
    <v-checkbox
      :key="structure?.value"
      v-model="checkValue"
      :color="structure?.color || 'accent'"
      :label="structure?.label || ''"
      @update:model-value="sendSelection"
    />
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue"
import { useEmitter } from "@/composables/useEmitter"

export default defineComponent({
  props: {
    id: String,
    structure: Object,
    customParams: Object
  },
  setup(props, { emit }) {
    const checkValue = ref(true)

    useEmitter(props, emit)

    onMounted(() => {
      // Inicializar o valor da checkbox com a estrutura
      checkValue.value = props.structure?.value
    })

    const sendSelection = () => {
      emit(props.structure?.selection.event, {
        id: props.structure?.id,
        value: checkValue.value,
        type: props.structure?.type,
        rules: props.structure?.selection.rules
      })
    }

    return {
      checkValue,
      sendSelection
    }
  }
})
</script>

<style scoped>
.v-input--selection-controls {
  margin-top: 0px;
}
</style>
