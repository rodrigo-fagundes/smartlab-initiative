import { TextTransformService } from "~/utils/service/singleton/textTransform"

export function useBaseLayout(customParams: any, emit: any) {
  const textTransformService = new TextTransformService()

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
          customParams,
          base_object,
          () => emit("sendInvalidInterpol")
        )
      }
    }
  }

  return {
    setComplexAttribute
  }
}
