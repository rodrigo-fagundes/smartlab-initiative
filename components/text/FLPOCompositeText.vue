<template>
  <v-container class="px-0 pb-0 pt-2">
    <v-row v-for="(descSection, index) in structure" :key="index" :class="descSection.class ? descSection.class : 'pr-0 pl-2 pb-0 pt-3'">
      <v-col>
        <v-row :class="sectionClass ? sectionClass : 'px-3'">
          <v-col>
            <!-- Seção de texto interpolado -->
            <v-row v-if="descSection.type === 'text'" column>
              <v-col v-if="descSection.title" :class="'headline-obs ' + (descSection.cls ? descSection.cls : 'py-0 px-4')">
                {{ descSection.title }}
              </v-col>
              <FLPOTextBuilder
                :reactive-filter="reactiveFilter"
                :custom-params="customParams"
                :structure="descSection.content"
                :read-more-limit="descSection.read_more_limit"
                @invalidateInterpol="throwInvalidInterpol"
              />
              <v-col v-if="descSection.comment != undefined" class="red--text pa-0 pb-4">
                {{ descSection.comment.fixed }}
              </v-col>
            </v-row>

            <!-- Seção de rankings -->
            <v-row v-else-if="descSection.type === 'ranking'" column class="pb-2">
              <v-col pa-0 class="headline-obs">
                {{ descSection.title }}
              </v-col>
              <FLPORankingText
                :custom-params="customParams"
                :structure="descSection"
              />
            </v-row>

            <!-- Seção de rankings lista -->
            <v-row v-else-if="descSection.type === 'ranking_list'" column pb-2>
              <v-col class="headline-obs pa-0 ml-2">
                {{ descSection.title }}
              </v-col>
              <v-row wrap :class="descSection.sectionClass ? descSection.sectionClass : 'pb-2'">
                <FLPORankingList
                  v-for="(ranking, index) in descSection.rankings.filter(filterGroup)"
                  :key="(ranking.group ? ranking.group : 'group') + index"
                  :structure="ranking"
                  :reactive-filter="reactiveFilter"
                  :custom-filters="customFilters"
                  :custom-params="customParams"
                />
              </v-row>
            </v-row>

            <!-- Seção de minicards -->
            <v-row v-else-if="descSection.type === 'minicards'" column pb-2>
              <v-col class="headline-obs pa-0">
                {{ descSection.title }}
              </v-col>
              <v-row wrap :class="descSection.sectionClass ? descSection.sectionClass : 'pb-4'">
                <FLPOMinicard
                  v-for="(miniCard, index) in descSection.cards.filter(filterGroup)"
                  :key="(miniCard.group ? miniCard.group : 'group') + index"
                  :reactive-filter="reactiveFilter"
                  :custom-filters="customFilters"
                  :structure="miniCard"
                  :custom-params="customParams"
                  :row-class="descSection.rowClass"
                />
              </v-row>
              <v-col v-if="descSection.comment != undefined" class="red--text pa-0 pb-4">
                {{ descSection.comment.fixed }}
              </v-col>
            </v-row>

            <v-row v-else-if="descSection.type === 'select' && isGroupActive(descSection)" column :class="descSection.cls ? descSection.cls : 'pb-2'">
              <v-col class="headline-obs pa-0">
                {{ descSection.title }}
              </v-col>
              <FLPOSelectEmitter
                :id="`${descSection.id}_${id}`"
                :reactive-parent="reactiveParent"
                :reactive-filter="reactiveFilter"
                :custom-params="customParams"
                :structure="descSection"
                @selection="triggerSelect"
                @default-selection="triggerDefaultSelect"
              />
            </v-row>
            <v-row
              v-else-if="descSection.type === 'legend-list' &&
                (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
              column
              :class="descSection.cls ? descSection.cls : 'pb-2'"
            >
              <v-col class="title-obs pa-0">
                {{ descSection.title }}
              </v-col>
              <FLPOLegendList
                :id="descSection.id + '_' + id"
                :structure="descSection"
              />
            </v-row>

            <v-row
              v-else-if="descSection.type === 'switch-group' &&
                (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
              column
              :class="descSection.cls ? descSection.cls : 'pb-2'"
            >
              <v-col v-if="descSection.title" class="title-obs pa-0">
                {{ descSection.title }}
              </v-col>
              <FLPOSwitchGroupEmitter
                :id="descSection.id + '_' + id"
                :structure="descSection"
                @selection="triggerSelect"
                @default-selection="triggerDefaultSelect"
              />
            </v-row>

            <v-row
              v-else-if="descSection.type === 'radio' &&
                (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
              column
              :class="descSection.cls ? descSection.cls : 'pb-2'"
            >
              <FLPORadioEmitter
                :id="descSection.id + '_' + id"
                :custom-params="customParams"
                :structure="descSection"
                @selection="triggerSelect"
                @default-selection="triggerDefaultSelect"
              />
            </v-row>

            <v-row
              v-else-if="descSection.type === 'check' &&
                (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
              column
              :class="descSection.cls ? descSection.cls : 'pb-2'"
            >
              <v-col v-if="descSection.title" class="headline-obs pa-0">
                {{ descSection.title }}
              </v-col>
              <FLPOCheckEmitter
                :id="descSection.id + '_' + id"
                :custom-params="customParams"
                :structure="descSection"
                @selection="triggerSelect"
                @default-selection="triggerDefaultSelect"
              />
            </v-row>

            <v-row
              v-else-if="descSection.type === 'slider' &&
                (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
              column
              :class="descSection.cls ? descSection.cls : 'pb-2'"
            >
              <v-col class="headline-obs pa-0">
                {{ descSection.title }}
              </v-col>
              <FLPOSliderEmitter
                :id="descSection.id + '_' + id"
                :custom-params="customParams"
                :structure="descSection"
                @selection="triggerSelect"
                @default-selection="triggerDefaultSelect"
              />
            </v-row>
            <!-- Seção de odômetro -->
            <v-row v-if="descSection.type === 'odometer'" column pb-2>
              <v-col
                class="headline-obs text-xs-center pa-0"
                :style="`background-color:${descSection.bg_color || 'black'};color:${descSection.title_font_color || 'white'}`"
              >
                {{ descSection.title }}
              </v-col>
              <FLPOOdometer
                :odometer-items="descSection.odometer_items"
                :comment-title="descSection.comment_title"
                :title-font-color="descSection.title_font_color"
                :bg-color="descSection.bg_color"
              />
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"

export default defineComponent({
  props: {
    id: String,
    structure: Object,
    customParams: Object,
    customFilters: Object,
    topology: Object,
    sectionIndex: Number,
    rowClass: String,
    activeGroup: String,
    sectionClass: String,
    reactiveFilter: Object,
  },
  setup(props, { emit }) {
    const dataset = ref<any[]>([])
    const metadata = ref<any[]>([])
    const datasetsComplete = ref(0)
    const reactiveParent = ref<string | undefined>(undefined)
    const { $chartGen } = useNuxtApp()


    const filterGroup = (card: any) => {
      if (card.group === undefined || card.group === null || card.group === props.activeGroup) {
        return card
      }
    }

    const triggerSelect = (payload: any) => {
      reactiveParent.value = payload.id
      emit("selection", payload)
    }

    const triggerDefaultSelect = (payload: any) => {
      reactiveParent.value = payload.id
      emit("default-selection", payload)
    }

    const throwInvalidInterpol = (payload: any) => {
      emit("resendInvalidInterpol", payload)
    }

    const isGroupActive = (descSection: any) => {
      return descSection.group === undefined || descSection.group === null || descSection.group === props.activeGroup
    }

    return {
      dataset,
      metadata,
      datasetsComplete,
      reactiveParent,
      filterGroup,
      triggerSelect,
      triggerDefaultSelect,
      throwInvalidInterpol,
      isGroupActive
    }
  }
})
</script>
