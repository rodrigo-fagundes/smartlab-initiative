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
              <v-col cols="12">
                <div class="display-4-obs ubuntu">
                  Iniciativa SmartLab
                </div>
              </v-col>
              <v-col cols="12">
                <div class="display-1-obs ubuntu-condensed">
                  Promoção do Trabalho Decente Guiada por Dados
                </div>
              </v-col>
              <v-col cols="10" md="4" class="pt-5 mt-3">
                <FLPOSearchBar />
              </v-col>
            </v-row>
          </v-col>
          <v-row
            v-if="smartlab"
            class="px-5"
            :class="{'justify-center': xlAndUp }"
          >
            <v-col
              v-for="(observatorio, indxObs) in smartlab.observatories"
              :key="'linked_card_obs_' + indxObs"
              class="pa-3"
              :cols="12"
              :sm="6"
              :md="4"
              :xl="2"
            >
              <FLPOLinkedViewCard
                title-color="white"
                :index-tab="30 + indxObs"
                :tag-color="observatorio.tagColor"
                :status="observatorio.status"
                :to="observatorio.to"
                :external="observatorio.external"
                :title="observatorio.short_desc"
                :ripple-color="ColorsService.getThemeFromId(observatorio.id).primary"
                :blocked="observatorio.blocked"
              />
            </v-col>
          </v-row>
        </v-row>
      </v-col>
      <v-col 
        v-if="smartlab && smartlab.sections"
        class="black--background"
      >
        <v-row
          v-for="(section, indxSctn) in smartlab.sections"
          :key="indxSctn"
          :style="{'background-image': `url('${section.section_background}')`}"
          class="obs_container text-left"
        >
          <v-row
            class="px-5 py-3"
          >
            <v-col v-if="!section.complement" cols="12">
              <div class="section-title">
                {{ section.title }}
              </div>
              <div class="section-description" v-html="section.description" />
            </v-col>
            <v-col v-if="section.complement"
              :xs="getColSize('xs',section.cls) || 9"
              :sm="getColSize('sm',section.cls)"
              :md="getColSize('md',section.cls)"
              :lg="getColSize('lg',section.cls)"
              :xl="getColSize('xl',section.cls)"
            >
              <div class="section-title">
                {{ section.title }}
              </div>
              <div class="section-description" v-html="section.description" />
            </v-col>
            <v-col
              v-if="section.complement"
              class="section-complement"
              :xs="getColSize('xs',section.complement.cls) || 3"
              :sm="getColSize('sm',section.complement.cls)"
              :md="getColSize('md',section.complement.cls)"
              :lg="getColSize('lg',section.complement.cls)"
              :xl="getColSize('xl',section.complement.cls)"
            >
              <FLPOMinicard
                v-for="(miniCard, indexMinicard) in section.complement.minicards"
                :key="'minicard_'+indexMinicard"
                :structure="miniCard"
              />
              <!-- <v-row
                v-for="(image, indexImage) in section.complement.images"
                :key="'img_'+indexImage"
                class="pa-0"
                justify="center"
              >
                <div
                  class="image-container"
                  :style="{'width': image.width ? image.width : ''}"
                >
                  <div v-if="image.tag" class="layout caption font-weight-bold pa-1 text-center soon-tag warning black--text">
                    {{ image.tag.text }}
                  </div>
                  <v-img
                    :src="image.url"
                    :class="(image.link_disabled ? 'link_disabled' : '') + ' complement-image'"
                  />
                </div>
              </v-row> -->
            </v-col>
          </v-row>
        </v-row>
        <v-row
          v-for="(observatorio, indxObs) in observatories"
          :key="'obs_section_'+indxObs"
          :style="{'background-image': `url('${observatorio.section_background}')`}"
          class="obs_container text-left"
        >
          <v-row
            v-if="!observatorio.blocked"
            class="px-5"
            align="start"
          >
            <v-col cols="12">
              <div class="section-title nav_first_section" @click="NavigationService.pushRoute(router, observatorio.to, observatorio.external)">
                {{ observatorio.title }}
              </div>
              <div class="section-description" v-html="observatorio.section_description" />
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { useDisplay } from "vuetify"
import { useMainStore } from "~/store"
import { onMounted, ref, watchEffect } from "vue"
import { storeToRefs } from "pinia"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { ColorsService } from "~/utils/service/singleton/colors.js"
import { useRoute, useRouter } from "vue-router"

export default {
  setup() {
    const store = useMainStore()
    const router = useRouter()
    const route = useRoute()
    const displayHeight = ref("auto")
    const parallaxFile = ref<string|null>(null)
    const { mdAndUp, xlAndUp } = useDisplay()
    const idParallaxfile = ref(0)
    const isFading = ref(false)
    const { $getColSize } = useNuxtApp()

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

    watch(
      () => currentObs.value, 
      async (newValue) => {
        if (newValue){
          if (smartlab.value){
            parallaxFile.value = smartlab.value.background_images[idParallaxfile.value]
          }

        }
      }
    )

    watchEffect(() => {
      resizeFirstSection()
    })

    onMounted(() => {
      setInterval(setParallaxFile, 20000)
      store.setCurrentObs(route)
      ColorsService.changeTheme(currentObsId.value)
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
      getColSize: $getColSize
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
