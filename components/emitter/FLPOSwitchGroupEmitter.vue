<template>
  <v-row align="center" wrap>
    <v-col
      v-for="eachSwitch in structure?.switches"
      :key="eachSwitch.id"
      :cols="12"
      :class="'ma-0 ' + (eachSwitch.cls || 'pb-0 pl-3')"
    >
      <v-row>
        <v-col v-if="eachSwitch.title" class="title-obs pa-0">
          {{ eachSwitch.title }}
        </v-col>
        <v-col>
          <v-switch
            v-model="selection[eachSwitch.id]"
            class="ma-0 pa-0"
            hide-details
            :color="eachSwitch.color || 'primary'"
            :readonly="!!eachSwitch.readonly"
            @update:model-value="toggleSwitch(eachSwitch)"
          >
            <template #label>
              <v-row align="center">
                <v-col>
                  {{ eachSwitch.label || '' }}
                </v-col>
                <FLPOMinicard
                  v-for="(miniCard, index) in eachSwitch.minicards"
                  :key="index"
                  :structure="miniCard"
                  :custom-params="customParams"
                  :row-class="miniCard.rowClass || 'pa-1'"
                />
              </v-row>
            </template>
          </v-switch>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue"

export default defineComponent({
  props: {
    id: String,
    structure: Object,
    customParams: Object
  },
  setup(props, { emit }) {
    useEmitter(props, emit)
    const selection = ref<Record<string, boolean>>({})

    // Inicializa a seleção dos switches
    const initializeSelection = () => {
      props.structure?.switches.forEach((switchItem: any) => {
        selection.value[switchItem.id] = switchItem.default ?? true
      })

      if (props.structure?.event) {
        emit(props.structure.event, {
          id: props.id,
          type: "switch-group",
          enabled: selection.value
        })
      }
    }

    // Toggle de um switch específico
    const toggleSwitch = (_struct: any) => {
      emit(props.structure?.event, {
        id: props.id,
        type: "switch-group",
        enabled: selection.value
      })
    }

    onMounted(() => {
      initializeSelection()
    })

    return {
      selection,
      toggleSwitch
    }
  }
})
</script>

<style scoped>
.control-top-align .v-input__slot {
  align-items: baseline;
}
</style>
