<template>
  <v-container class="pa-0" fluid>
    <v-row class="pa-0">
      <v-col
        cols="12"
        class="first-section pa-0"
        :style="displayHeight"
      >
        <!-- <v-row class="bg-home-shadow ma-0" /> -->
        <v-row
          align="center"
          justify="center"
          class="animated-background-row pa-5"
        >
          <v-img
            v-if="parallaxFile" 
            :src="currentParallax"
            class="animated-background"
            :class="{ 'fade-in': isFading }" 
            alt="Imagem de Fundo"
            cover
          ></v-img>
          <v-col cols="12" class="text-center py-4 my-5 animated-background-content">
            <v-row justify="center">
              <v-col
                id="screenTitle"
                cols="12"
                :class="`d-flex justify-center ${computedClasses}`"
              >
                <v-img
                  :src="`/smartlab/${currentObsId ? currentObsId.concat('.svg') : ''}`"
                  :alt="currentObs ? currentObs.title : ''"
                  width="100%"
                  max-width="680px"
                />
              </v-col>
              <v-col cols="12">
                <v-row
                  align="center"
                  justify="center"
                >
                  <v-col
                    cols="10"
                    md="4"
                    class="pt-5 mt-3"
                  >
                    <FLPOSearchBar />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-row
            v-if="smartlab && currentObs"
            class="px-5"
            :class="{'justify-center': xlAndUp }"
          >
            <v-col
              xs="12"
              class="d-flex justify-end px-5 mx-5"
              style="min-height:48px"
            >
              <!-- Botão para SmartMap -->
              <v-tooltip location="bottom">
                <template #activator="{ props }">
                  <v-btn 
                    v-bind="props" 
                    v-if="currentObs && currentObs.obsPage?.prevalencia"
                    class="ml-0"
                    icon
                    aria-label="SmartMap"
                    variant="text"
                    dark
                    @click="scrollTo('smartmap')"
                  >
                  <v-icon
                    color="white"
                  >
                    mdi-earth
                  </v-icon>
                  </v-btn>
                </template>
                SmartMap
              </v-tooltip>

              <!-- Botão para SmartLines -->
              <v-tooltip location="bottom">
                <template #activator="{ props }">
                  <v-btn 
                    v-bind="props" 
                    v-if="currentObs && currentObs.obsPage?.sparklines"
                    class="ml-0"
                    icon
                    aria-label="SmartLines"
                    variant="text"
                    @click="scrollTo('sparklines')"
                  >
                    <v-icon
                      color="white"
                    >
                      mdi-chart-line
                    </v-icon>
                  </v-btn>
                </template>
                SmartLines
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row
            v-if="smartlab && currentObs"
            class="px-5"
            :class="{'justify-center': xlAndUp }"
          >
            <v-col
              v-for="(dimensao, indxDim) in currentObs?.dimensions"
              :key="'linked_card_obs_' + indxDim"
              class="pa-3"
              :cols="12"
              :sm="6"
              :md="4"
              :xl="2"
            >
              <FLPOLinkedViewCard
                title-color="white"
                :index-tab="30 + indxDim"
                :tag-color="dimensao.tagColor"
                :status="dimensao.status"
                :to="dimensao.to"
                :external="dimensao.external"
                :title="dimensao.short_desc"
                :blocked="dimensao.blocked"
              />
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <v-row
      v-if="smartlab && currentObs"
    >
      <v-col v-if="currentObs?.obsPage?.prevalencia?.odometers" cols="12" class="pt-0">
        <v-row>
          <v-col
            class="headline-obs text-center pa-0"
            :style="{
              backgroundColor: currentObs.obsPage.prevalencia.odometers.bg_color || 'black',
              color: currentObs.obsPage.prevalencia.odometers.title_font_color || 'white'
            }"
          >
            {{ currentObs.obsPage.prevalencia.odometers.title }}
          </v-col>
        </v-row>

        <FLPOOdometer
          :odometer-items="currentObs.obsPage.prevalencia.odometers.odometer_items"
          :comment-title="currentObs.obsPage.prevalencia.odometers.comment_title"
          :title-font-color="currentObs.obsPage.prevalencia.odometers.title_font_color"
          :bg-color="currentObs.obsPage.prevalencia.odometers.bg_color"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="currentObs?.obsPage?.prevalencia.main_title" pt-0 cols="12">
        <v-row>
          <v-col
            pa-0
            style="background-color:black;color:white"
          >
            <FLPOCompositeText
              :id="'story_home_prevalencia_main_title_' + currentObsId"
              :structure="currentObs.obsPage.prevalencia.main_title"
              :custom-params="customParams"
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="4" lg="3">
        <v-row
          align="end"
          class="fill-height wrap pl-3 pt-3 pr-2 ma-0 subheading mb-0"
        >
          <v-col class="headline-obs card-title pb-0 pl-3">
            {{ prevTitle }}
            <v-tooltip v-if="currentObs?.obsPage?.prevalencia.info" bottom>
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  color="accent"
                  class="pb-1"
                >
                  info
                </v-icon>
              </template>
              <FLPOCompositeText
                :id="'info_home_prevalencia_' + currentObsId"
                :structure="currentObs.obsPage.prevalencia.info"
                :custom-params="customParams"
              />
            </v-tooltip>
            <div v-if="prevTitleComment != null" class="title-comment" v-html="prevTitleComment"></div>
          </v-col>

          <FLPOCompositeText
            v-if="currentObs && currentObs.obsPage && currentObs.obsPage.prevalencia"
            :id="'story_home_prevalencia' + currentObsId"
            :section-class="'px-2 py-0'"
            :structure="currentObs.obsPage.prevalencia.description"
            :custom-params="customParams"
            :reactive-filter="reactiveFilter"
            :custom-filters="customParams"
          />
          <!-- @selection="triggerSelect" -->

          <FLPOCompositeText
            v-if="currentObs && currentObs.obsPage && currentObs.obsPage.prevalencia && currentObs.obsPage.prevalencia.footer"
            :id="'story_home_prevalencia_footer_' + currentObsId"
            :section-class="'py-0'"
            :structure="currentObs.obsPage.prevalencia.footer"
            :custom-params="customParams"
            :custom-filters="customParams"
          />

        </v-row>
      </v-col>
      <v-col cols="12" md="8" lg="6">
        <v-row>
          <v-col>
            <v-container style="position: relative;">
              <v-row v-if="currentObs" class="cursor-pointer" style="height: auto;" @mousedown="dialogMapLoading = true">
                <v-col cols="12">
                  <v-img
                    :src="'/parallax/' + currentObs?.obsPage?.map_image"
                    :aspect-ratio="currentObs?.obsPage?.prevalencia.chart_options.height_proportion || 1"
                  >
                    <div 
                      v-show="!mapEnabled" 
                      class="bg-black-transparent pa-3 justify-end subheading fill-height d-flex align-items-center"
                      @click="enableMap"
                    >
                      Clique no mapa para ativá-lo
                    </div>
                  </v-img>
                </v-col>
              </v-row>
            </v-container>            
          </v-col>
          <v-col cols="12" class="pb-2">
            <v-row 
              v-if="currentObs?.obsPage?.ranking_cards"
            >
              <FLPORankingList
                v-for="(ranking, index) in currentObs.obsPage.ranking_cards"
                :key="index"
                :structure="ranking"
                :custom-params="customParams"
              />
            </v-row>
            <FLPOCompositeText
              v-if="currentObs?.obsPage?.prevalencia?.description_bottom"
              :id="'story_home_prevalencia_desc_b_' + currentObsId"
              :structure="currentObs.obsPage.prevalencia.description_bottom"
              section-class="pa-0"
              :custom-params="customParams"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="12" md="12" lg="3">
          <FLPOCompositeText
            v-if="currentObs?.obsPage?.prevalencia.description_right &&
              (!hasOdometers || loadedOdometers)"
            :id="'story_home_prevalencia_desc_r_' + currentObsId"
            :structure="currentObs.obsPage.prevalencia.description_right"
            :custom-params="customParams"
          />
      </v-col>


    </v-row>
  </v-container>
</template>

<script lang="ts">
import { useDisplay } from "vuetify"
import { useMainStore } from "~/store"
import { onMounted, onBeforeMount, ref, watchEffect } from "vue"
import { storeToRefs } from "pinia"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { ColorsService } from "~/utils/service/singleton/colors.js"
import { useRoute, useRouter } from "vue-router"
import { TextTransformService } from "@/utils/service/singleton/textTransform"

const textTransformService = new TextTransformService()

export default {
  setup() {
    const store = useMainStore()
    const router = useRouter()
    const route = useRoute()
    const displayHeight = ref("auto")
    const parallaxFile = ref<string|null>(null)
    const { mdAndUp, xlAndUp } = useDisplay()
    const { xs, sm, md, lg } = useDisplay()
    const idParallaxfile = ref(0)
    const isFading = ref(false)
    const customParams = ref<Record<string, any>>({})
    const reactiveFilter = ref<any>(null)
    const { $fillDataStructure } = useNuxtApp()
    const prevTitle = ref("")
    const prevTitleComment = ref("")
    const mapEnabled = ref(false)
    const hasOdometers = ref(false)
    const loadedOdometers = ref(false)
    const dialogMapLoading = ref(false)

    const { smartlab, observatories, currentObs, currentObsId, currentDimension } = storeToRefs(store)

    // const { $reformDataset } = useNuxtApp()

    // const ds = [
    //   { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 123.45 },
    //   { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 678.9 }
    // ]
    // const options = {
    //   formatters: [
    //     { id: "vl_indicador", format: "inteiro" }
    //   ]
    // }
    // const result = $reformDataset(ds, options, {})
    // console.log(result)

    const currentParallax = computed(() => {
      return parallaxFile.value
        ? `/parallax/${parallaxFile.value}`
        : ""
    })

    const resizeFirstSection = () => {
      if (mdAndUp.value) {
        displayHeight.value = "min-height:" + (window.innerHeight - 64) + "px"
      } else {
        displayHeight.value = "height:auto"
      }
    }

    const enableMap =  () => {
      if (!mapEnabled.value) { console.log("Carrega mapa") }
    }


    const computedClasses = computed(() => {
      if (xs.value) {
        return "px-1 pt-1 mx-1 mt-1"
      } else if (sm.value && !xs.value) {
        return "px-2 pt-2 mx-2 mt-2"
      } else if (md.value && !sm.value) {
        return "px-3 pt-3 mx-3 mt-3"
      } else if (lg.value) {
        return "px-4 pt-4 mx-4 mt-4"
      }
      return ""
    })    

    const setComplexAttribute = (dataset: Record<string, any> | string, _rules: Record<string, any>, structure:Record<string, any>, addedParams?: Record<string, any> | string, _metadata?: Record<string, any>) => {
      if (typeof addedParams === "object" && addedParams.attribute) {
        if (typeof dataset === "string") {
          addedParams.attribRefs[addedParams.attribute].value = dataset
        } else {
          let base_object = {}
          if (Array.isArray(dataset) && dataset.length === 1) {
            base_object = dataset[0]
          } else if (dataset !== null && dataset !== undefined) {
            base_object = dataset
          }

          // Aplicação de interpolação usando um serviço que está disponível no contexto
          addedParams.attribRefs[addedParams.attribute].value = textTransformService.applyInterpol(
            structure,
            customParams.value,
            base_object
          )
        }
      }
    }

    watch(
      () => currentObs.value, 
      async (newValue) => {
        if (newValue){
          if (currentObs.value && currentObs.value.obsPage){
            parallaxFile.value = currentObs.value.obsPage.background_images[idParallaxfile.value]
          }
        }
      }
    )

    watchEffect(() => {
      resizeFirstSection()
    })

    onBeforeMount(async() => {
      if (store.smartlab == null){
        await store.loadSmartlabData()
      }
      store.setCurrentObs(route)
      setInterval(setParallaxFile, 20000)
    })
    onMounted(() => {
      ColorsService.changeTheme(currentObsId.value)
      if (currentObs.value?.obsPage?.prevalencia) {
        $fillDataStructure(
          currentObs.value.obsPage.prevalencia.title,
          customParams.value, 
          setComplexAttribute,
          { attribute: "prevTitle", attribRefs: {prevTitle: prevTitle} }
        )
        $fillDataStructure(
          currentObs.value.obsPage.prevalencia.title_comment,
          customParams.value,
          setComplexAttribute,
          { attribute: "prevTitleComment", attribRefs: {prevTitleComment: prevTitleComment}}
        )
      }

      if (currentObs.value?.obsPage?.prevalencia && currentObs.value?.obsPage?.prevalencia.odometers) {
        hasOdometers.value = true
        if (currentObsId.value == "sst") {
          const url = "/odometros/sst"
          $fetch(UrlTransformService.getApiUrl(url))
            .then((result: any) => {
              const odometros = JSON.parse(result.data)
              customParams.value.odometros = odometros
              loadedOdometers.value = true
            })
        }
      } else {
        hasOdometers.value = false
      }

      // if (smAndDown.value) {
      //   obsMaxSlice.value = 11;
      //   obsSlice.value = 0;
      //   obsSliceSize.value = 1;
      // }
    })

    const setParallaxFile = () => {
      isFading.value = true
      idParallaxfile.value++
      if (idParallaxfile.value == smartlab.value?.background_images.length) {
        idParallaxfile.value = 0
      }
      setTimeout(() => {
        if (smartlab.value) {
          parallaxFile.value = smartlab.value?.background_images[idParallaxfile.value]
        }
        isFading.value = false
      }, 2000)
    }

    const scrollTo = (anchor: string) => {
      const el = document.getElementById(anchor)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
        window.scrollBy(0, -60) // Ajuste de posição após o scroll
      }
    }    
    
    return {
      smartlab,
      observatories,
      currentObs,
      currentObsId,
      currentDimension,
      router,
      route,
      NavigationService,
      ColorsService,
      displayHeight,
      parallaxFile,
      currentParallax,
      xlAndUp,
      isFading,
      computedClasses,
      scrollTo,
      customParams,
      reactiveFilter,
      prevTitle,
      prevTitleComment,
      mapEnabled,
      enableMap,
      hasOdometers,
      loadedOdometers,
      dialogMapLoading
    }
  }
}

</script>

<style scoped>
  .mainSearch .v-input__append-outer {
    z-index: 1 !important;
  }

  .search-group .input-group {
    padding: 0;
  }

  .search-group .input-group__details {
    display: none;
  }

  .radio label {
    font-family: titulos-observatorio, sans-serif !important;
    font-size: x-large;
  }

  .v-text-field.v-text-field--enclosed .v-text-field__details {
    display: none;
  }

  .screen-busca {
    background-color: rgba(256, 256, 256, 0.4);
    border-color: transparent !important;
  }

  .screen-busca.v-select--is-menu-active {
    background-color: rgba(256,256,256,0.7) !important;
  }

  .screen-busca .v-input__slot {
    border-color: transparent !important;
  }

  .screen-busca .v-icon {
    transform: none !important;
    -webkit-transform: none !important;
  }

  .timeline-item {
    align-self: center;
  }

  .nav_first_section {
    cursor: pointer !important;
  }

  .anchor-cards .container{
    color: black;
  }

  .black--background {
    background-color: black;
  }
  .obs_container{
    background-size: cover;
    background-position: top;
    color: white;
  }
  .section {
    min-height: 95vh;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 30px;
    padding-top: 30px;
    padding-left: 8px;
    padding-right: 8px;
    background-size: cover;
    background-position: top;
  }
  .section-title {
    font-family: titulos-observatorio, sans-serif;
    font-size: 3rem;
    margin: 16px;
    line-height: 1.1;
    margin-bottom: 40px;
  }
  .section-description {
    font-size: 1.45rem;
     margin: 16px;
  }
  .section-complement {
    font-size: 1.3rem;
     margin-top: 22px;
  }
  .complement-image {
    border-color: rgba(255, 255, 255, 0.3);
    border-width: 1px;
    border-style: solid;
    cursor: pointer;
  }
  .link_disabled {
    cursor: default;
  }

  .section-complement .minicard-description {
    font-size: 1rem !important;
  }

  .section-complement .minicard-comment {
    font-size: 1rem !important;
  }

  .soon-tag {
    display: block;
    position: absolute;
    width: 136px;
    top: 24px;
    right: -32px;
    z-index: +1;
    transform: rotate(45deg);
  }
  .image-container {
    position: relative;
    overflow: hidden;
  }
</style>
