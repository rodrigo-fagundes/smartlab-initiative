<template>
  <v-row>
    <v-col
      v-for="eachItem in structure?.items"
      :key="eachItem.id"
      :class="'ma-0 ' + (eachItem.cls ? eachItem.cls : 'pb-0 pl-3')"
      :xs="getColSize('xs',eachItem.cls) || 12"
      :sm="getColSize('sm',eachItem.cls)"
      :md="getColSize('md',eachItem.cls)"
      :lg="getColSize('lg',eachItem.cls)"
      :xl="getColSize('xl',eachItem.cls)"
    >
      <v-row>
        <v-col cols="1" class="pt-1 pr-3">
          <v-icon
            :color="eachItem.color ? eachItem.color : 'primary'"
            size="small"
          >
            {{ eachItem.icon ? eachItem.icon : (structure?.icon ? structure.icon : 'mdi-circle') }}
          </v-icon>
        </v-col>
        <v-col class="caption pt-2">
          {{ eachItem.label }}
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  props: {
    id: String,
    structure: Object
  },
  setup() {
    const { $getColSize } = useNuxtApp()
    return {
      getColSize: $getColSize
    }  
  }
})
</script>

<style scoped>
.control-top-align .v-input__slot {
  align-items: baseline;
}
</style>
