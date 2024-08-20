import { NumberTransformService } from "~/utils/service/singleton/numberTransform"

const numberTransformService = new NumberTransformService()

export default defineNuxtPlugin(nuxtApp => {
  const functions = {
    concat_values: function (
      _indicador: any, // "indicador" não é usado na função. Pode ser removido ou tipado conforme necessário.
      value1: string,
      value2: string,
      value3: string = "",
      value4: string = "",
      value5: string = ""
    ): string {
      return `${value1} ${value2} ${value3} ${value4} ${value5}`
    },
    calc_subtraction: function (
      a: number,
      b: number,
      c: number = 0
    ): number {
      return a - (b - c)
    },
    calc_complemetary_absolut_from_percentage: function (
      percentage: number,
      absTotal: number
    ): number {
      return (absTotal * (100 - percentage)) / 100
    },
    calc_distinct_count_ds: function (
      d: any, // "d" não é usado na função. Pode ser removido ou tipado conforme necessário.
      strValues: string,
      separator: string = ", "
    ): number {
      return new Set(strValues.split(separator)).size
    },          
    oppose: function (
      d: Record<string, number>,
      propRef: string,
      valueRef: number,
      propVal: string
    ): number {
      if (d[propRef] === valueRef) {
        return -d[propVal]
      }
      return d[propVal]
    },
    get_bin: function (
      d: any, // "d" não é usado na função. Pode ser removido ou tipado conforme necessário.
      value: number,
      bins: number[] = [10, 50, 100, 500],
      decimal: number = 0
    ): string | number {
      if (value === 0) {
        return "Nenhum"
      }
      for (let i = 0; i < bins.length; i++) {
        if (value <= bins[i]) {
          if (i === 0) {
            return `Até ${bins[i].toLocaleString("pt-br", { maximumFractionDigits: decimal })}`
          } else {
            return `De ${(bins[i - 1] + (decimal === 0 ? 1 : (1 / (10 ** decimal)))).toLocaleString("pt-br", { maximumFractionDigits: decimal })} a ${bins[i].toLocaleString("pt-br", { maximumFractionDigits: decimal })}`
          }
        }
      }
      return value
    },
    get_bin_faixa_etaria: function (
      d: Record<string, number>, // "d" não é usado na função. Pode ser removido ou tipado conforme necessário.
      age_prop: string
    ): string {
      if (d[age_prop] <= 17) {
        return "01" // < 18
      }
      if (d[age_prop] <= 24) {
        return "02" // 18-24
      }
      if (d[age_prop] <= 29) {
        return "03" // 25-29
      }
      if (d[age_prop] <= 34) {
        return "04" // 30-34
      }
      if (d[age_prop] <= 39) {
        return "05" // 35-39
      }
      if (d[age_prop] <= 44) {
        return "06" // 40-44
      }
      if (d[age_prop] <= 49) {
        return "07" // 45-49
      }
      if (d[age_prop] <= 54) {
        return "08" // 50-54
      }
      if (d[age_prop] <= 59) {
        return "09" // 55-59
      }
      return "10" // > 60
    },
    get_faixa_etaria: function (
      d: Record<string, number>,
      age_prop: string
    ): string {
      if (d[age_prop] <= 17) {
        return "< 18"
      }
      if (d[age_prop] <= 24) {
        return "18-24"
      }
      if (d[age_prop] <= 29) {
        return "25-29"
      }
      if (d[age_prop] <= 34) {
        return "30-34"
      }
      if (d[age_prop] <= 39) {
        return "35-39"
      }
      if (d[age_prop] <= 44) {
        return "40-44"
      }
      if (d[age_prop] <= 49) {
        return "45-49"
      }
      if (d[age_prop] <= 54) {
        return "50-54"
      }
      if (d[age_prop] <= 59) {
        return "55-59"
      }
      return "> 60"
    },
    get_frequencia_fluxo: function (_d: any, quantidade: number): string {
      if (quantidade <= 10) { 
        return "Baixa Frequência" 
      } // <= 10
      if (quantidade <= 30) { 
        return "Média Frequência" 
      } // 11-30
      return "Alta Frequência" // > 30
    },
    get_detail_value: function (
      _d: any, 
      class_indicador: string = "", 
      value: number | null = null, 
      rank_br: number | null = null, 
      rank_uf: number | null = null, 
      media_br: number | null = null, 
      media_uf: number | null = null
    ): string {
      let detail = ""
      let imgColorBR = "grey"
      let imgColorUF = "grey"
    
      if (class_indicador == "bom" || class_indicador == "ruim") {
        if ((class_indicador == "bom" && value !== null && value <= media_br!) ||
            (class_indicador == "ruim" && value !== null && value >= media_br!)) {
          imgColorBR = "red"
        }
        if ((class_indicador == "bom" && value !== null && value <= media_uf!) ||
            (class_indicador == "ruim" && value !== null && value >= media_uf!)) {
          imgColorUF = "red"
        }
      }
    
      if (rank_br !== null) {
        detail += "<span> " +
            "<img  " +
            "  src='/smartlab/rank_br_ret_" + imgColorBR + ".svg'" +
            "  title='" + numberTransformService.formatNumber(rank_br, "inteiro", 0) + "º no BR'" +
            "  height='13px'  " +
            "/> " +
            "</span>"
      }
    
      if (rank_uf !== null) {
        detail += "<span> " +
            "<img  " +
            "  src='/smartlab/rank_uf_ret_" + imgColorUF + ".svg' " +
            "  title='" + numberTransformService.formatNumber(rank_uf, "inteiro", 0) + "º na UF'" +
            "  height='13px'  " +
            "/>" +
            "</span>"
      }
    
      return detail
    },        
    get_formatted_value: function (
      _d: any, 
      ds_indicador: string, 
      value: number | null, 
      type: string
    ): string | number {
      switch (type) {
      case "(Pessoas)":
      case "(Admitidos - Desligados)":
      case "(Quantidade)":
      case "Quantidade":
        return numberTransformService.formatNumber(
          value, "inteiro", 0
        )
      case "(Percentual)":
        return numberTransformService.formatNumber(
          value, "porcentagem", 1, null, null, false, false
        )
      case "(Índice)":
        if (ds_indicador.startsWith("IDH ")) {
          if (value! < 0.5) {
            return numberTransformService.formatNumber(value, "real", 3) + " (Muito baixo)"
          } else if (value! < 0.6) {
            return numberTransformService.formatNumber(value, "real", 3) + " (Baixo)"
          } else if (value! < 0.7) {
            return numberTransformService.formatNumber(value, "real", 3) + " (Médio)"
          } else if (value! < 0.8) {
            return numberTransformService.formatNumber(value, "real", 3) + " (Alto)"
          } else {
            return numberTransformService.formatNumber(value, "real", 3) + " (Muito alto)"
          }
        } else {
          return numberTransformService.formatNumber(
            value, "real", 3
          )
        }
      case "(em R$ x 1.000)":
        return numberTransformService.formatNumber(
          value, "monetario", 2, 1000, { formato: "monetario", casasDecimais: 1 }, false, false
        )
      case "(R$)":
        return numberTransformService.formatNumber(
          value, "monetario", 2, 1, null, false, false
        )
      case "(Razão)":
        return numberTransformService.formatNumber(
          value, "real", 1
        )
      case "":
        if (ds_indicador.startsWith("Remuneração Média ")) {
          return numberTransformService.formatNumber(
            value, "monetario", 2, 1, { formato: "monetario", casasDecimais: 1 }, false, false
          )
        } else {
          return (value !== null && value !== undefined) ? value.toString() : ""
        }
      default:
        return (value !== null && value !== undefined) ? value.toString() : ""
      }
    },
    calc_subtraction_ds: function (
      _d: any, 
      a: number, 
      b: number
    ): number {
      return a - b
    },
    calc_addition_ids_ds: function (
      _d: any, 
      a: number, 
      b: number, 
      multiplier: number = 10000000
    ): number {
      return a * multiplier + b
    },
    calc_multiplication_ds: function (
      _d: any, 
      a: number, 
      b: number
    ): number {
      return a * b
    },
    calc_percentage_ds: function (
      _d: any, 
      parte: number, 
      total: number
    ): number {
      return parte / total * 100
    },
    calc_percentage_val1_ds: function (
      _d: any, 
      val1: number, 
      val2: number
    ): number {
      return val1 / (val1 + val2) * 100
    },
    calc_percentage_difference_ds: function (
      _d: any, 
      a: number, 
      b: number, 
      value_to_compare: number, 
      min_value: number
    ): number | null {
      if (value_to_compare < min_value || !a || !b) {
        return null
      }
      return ((Math.abs(a - b) / a) * 100)
    },
    calc_addition: function (
      a: number, 
      b: number
    ): number {
      return a + b
    },
    calc_percentage: function (
      parte: number, 
      total: number
    ): number {
      return parte / total * 100
    },
    calc_percentage_2values: function (
      val1: number, 
      val2: number, 
      total: number
    ): number {
      return (val1 + val2) / total * 100
    },
    calc_proportion: function (
      dividendo: number, 
      divisor: number
    ): number {
      return dividendo / divisor
    },
    calc_proportion_ds: function (
      _d: any, 
      dividendo: number, 
      divisor: number
    ): number | null {
      return divisor === 0 ? null : dividendo / divisor
    },
    get_flag_value_ds: function (
      _d: any, 
      valor: number | null
    ): string {
      switch (valor) {
      case null:
        return "Sem casos mapeados"
      case 0:
        return "Sem casos mapeados"
      default:
        return "Sim"
      }
    },
    get_flag_value: function (
      valor: number | null
    ): string {
      switch (valor) {
      case null:
        return "Sem casos mapeados"
      case 0:
        return "Sem casos mapeados"
      default:
        return "Sim"
      }
    },
    get_flag_number: function (
      _d: any, 
      a: number
    ): string {
      return a >= 0 ? "Positivo" : "Negativo"
    },
    get_te_label: function (
      d: Record<string, string>,
      campo: string
    ): string {
      switch (d[campo]) {
      case "te_nat":
        return "Vítimas que nasceram na localidade"
      case "te_res":
        return "Vítimas que residem na localidade"
      case "te_rgt":
        return "Vítimas resgatadas na localidade"
      case "te_sit_trab_resgatados":
        return "Vítimas resgatadas na localidade"
      default:
        return d[campo]
      }
    },
    get_period_from_string: function (
      str: string
    ): string {
      const reg: RegExp = /de \d{4} a \d{4}/g
      return (str.match(reg) as string[]).join("")
    },
    get_text_from_parentheses_ds: function (
      _d: any, 
      str: string
    ): string {
      const reg: RegExp = /\(.*\)/
      let returnStr: string | null = (String(str).match(reg) as string[]).join("")
      returnStr = String(returnStr).replace("(", "").replace(")", "")
      return returnStr
    },
    get_proportional_indicator_uf: function (
      d: Record<string, number>, 
      campo: string = "vl_indicador", 
      media: string = "media_uf", 
      except_ind: number | null = null
    ): number {
      if (except_ind && d.cd_indicador == except_ind) {
        return d[campo]
      }
      return Math.log(((d[campo] - d[media]) / d[media]) + 1.01) + 10
    },
    get_log: function (
      d: Record<string, number>, 
      campo: string = "vl_indicador", 
      except_ind: number | null = null
    ): number {
      if (except_ind && d.cd_indicador == except_ind) {
        return d[campo]
      }
      return Math.log(d[campo] + 0.01) + 10
    },
    get_round: function (
      d: Record<string, number>, 
      campo: string = "vl_indicador"
    ): number {
      return Math.round(d[campo])
    },
    get_number: function (
      _d: any, 
      val: string
    ): number {
      return parseFloat(val)
    },

    // get_week_status: function (
    //   d: Record<string, number>, 
    //   reg_week: number
    // ): string {
    //   const DateClass = Date;
    //   DateClass.prototype.getWeekNumber = function (): number {
    //     const dt = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    //     const dayNum = dt.getUTCDay() || 7;
    //     dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
    //     const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    //     return Math.ceil((((dt.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    //   };
    //   const week = new DateClass().getFullYear() * 100 + new DateClass().getWeekNumber();
    //   if (reg_week == week) {
    //     return "Semana corrente";
    //   } else {
    //     return "Semana completa";
    //   },
    get_week_year: function (
      d: Record<string, number>, 
      week: number, 
      week_start: string
    ): string {
      const wee_start_ISO: string = new Date(week_start).toISOString().substring(0, 10)
      return wee_start_ISO.substring(0, 4) + "-" + week.toString().padStart(2, "0")
    },
    get_bipolar_scale: function (
      d: Record<string, number>, 
      prop: string, 
      origin: number = 0
    ): number | null {
      if (d[prop] == null) {
        return null
      }
      const val: number = d[prop] - origin
      if (val > 0) {
        return Math.log(val / d.maxVal + 1.0001) + 100
      }
      if (val < 0) {
        return d.minVal == 0 ? -Math.log(Math.abs(val) + 1.0001) + 100 : -Math.log(Math.abs(val) / Math.abs(d.minVal) + 1.0001) + 100
      }
      return 100
    },
    inv_deviation: function (
      v: number, 
      bs: number
    ): string {
      const valor: number = (Math.exp(v) - 1.01) * bs + bs
      return valor.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    },
    concat_ds_vl: function (
      d: Record<string, number | string | null>, 
      formato: string, 
      casasDecimais: number
    ): string {
      let valor: string | number | null = null
      if (d.vl_indicador === null || d.vl_indicador === undefined) {
        valor = "-"
      } else {
        valor = parseFloat(d.vl_indicador as string)
        if (casasDecimais === null || casasDecimais === undefined) {
          casasDecimais = 2
        }
        switch (formato) {
        case "inteiro":
          valor = valor.toLocaleString("pt-br", { maximumFractionDigits: 0 })
          break
        case "real":
          valor = valor.toLocaleString("pt-br", { maximumFractionDigits: casasDecimais, minimumFractionDigits: casasDecimais })
          break
        case "porcentagem":
          valor = valor.toLocaleString("pt-br", { maximumFractionDigits: casasDecimais, minimumFractionDigits: casasDecimais }) + "%"
          break
        case "monetario":
          valor = "R$ " + valor.toLocaleString("pt-br", { maximumFractionDigits: 0 })
          break
        default:
          valor = valor.toLocaleString("pt-br")
        }
      }
      return d.ds_indicador_radical + ": " + valor
    },
    get_proportional_resg_fisc: function (
      d: Record<string, number>
    ): number {
      return d.qt_resgatados / d.qt_ope
    },
    get_idh_level: function (
      d: Record<string, number>
    ): number {
      if (d.vl_indicador < 0.5) {
        return 1 // Muito Baixo
      }
      if (d.vl_indicador < 0.6) {
        return 2 // Baixo
      }
      if (d.vl_indicador < 0.7) {
        return 3 // Médio
      }
      if (d.vl_indicador < 0.8) {
        return 4 // Alto
      }
      return 5
    },
    get_uti_level: function (
      d: Record<string, number>, 
      value: number | null
    ): string {
      if (value == null) {
        return "Não informado"
      }
      if (value < 1) {
        return "Abaixo do recomendado"
      }
      if (value <= 3) {
        return "Dentro do recomendado"
      }
      if (value > 3) {
        return "Acima do recomendado"
      }
      return "Não informado"
    },
    remove_year: function (
      d: Record<string, string>
    ): string {
      return String(d.ds_indicador_radical).replace(d.nu_competencia, "").replace("  ", " ")
    },
    absolute: function (
      d: Record<string, number>, 
      campo: string = "vl_indicador"
    ): number {
      return Math.abs(d[campo])
    },
    to_upper_ds: function (
      d: Record<string, string>, 
      value_field: string
    ): string {
      return d[value_field].toUpperCase()
    },
    format_scope: function (
      scope: number | string, 
      type: string = "month"
    ): string {
      const sc: string = typeof (scope) === "number" ? scope.toString() : scope
      if (type == "month" && sc.length == 6) {
        const months: string[] = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
        return months[parseInt(sc.substr(4, 2)) - 1] + " de " + sc.substr(0, 4)
      } else if (type == "year" && sc.length == 6) {
        return sc.substr(0, 4)
      } else {
        return sc
      }
    },
    format_month: function (
      month_ym: number | string
    ): string {
      const ym: string = typeof (month_ym) === "number" ? month_ym.toString() : month_ym
      return ym.substr(4, 2) + "/" + ym.substr(0, 4)
    },
    format_month_ds: function (
      d: Record<string, string>, 
      month_ym: number | string
    ): string {
      const ym: string = typeof (month_ym) === "number" ? month_ym.toString() : month_ym
      return ym.substr(4, 2) + "/" + ym.substr(0, 4)
    },
    format_quarter_ds: function (
      d: Record<string, string>, 
      quarter_yq: number | string
    ): string {
      const yq: string = typeof (quarter_yq) === "number" ? quarter_yq.toString() : quarter_yq
      return yq.substr(5, 1) + "º Trimestre " + yq.substr(0, 4)
    },
    format_quarter_ds_short: function (
      d: Record<string, string>, 
      quarter_yq: number | string
    ): string {
      const yq: string = typeof (quarter_yq) === "number" ? quarter_yq.toString() : quarter_yq
      return yq.substr(5, 1) + "º T " + yq.substr(0, 4)
    },
    format_gender_color_ds: function (
      _d: any,
      gender: string,
      color: string
    ): string {
      if (color === "BRANCA") {
        return gender === "Homens" ? "Homem Branco" : "Mulher Branca"
      } else if (color === "PRETA") {
        return gender === "Homens" ? "Homem Negro" : "Mulher Negra"
      }
      return gender + " " + color
    },
    format_gender_type_ds: function (
      _d: any, 
      gender: string, 
      type: string
    ): string {
      return gender === "Homens" ? "Homem " + type : "Mulher " + type
    },
    capitalize_first_letter: function (
      str: string
    ): string {
      return str.charAt(0).toUpperCase() + str.slice(1)  
    },
    concat_descriptions: function (
      d: Record<string, string>
    ) {
      return d.desc_indicador + " - " + d.ds_indicador_radical  
    },
    replace_text: function (
      d: Record<string, string>,
      field: string, 
      text: string, 
      text_replace: string
    ): string {
      return d[field].replace(text, text_replace)
    },
    replace_text_namepercent: function (
      d: Record<string, string>,
      options: Record<string, string>
    ): string {
      return d[options.name_field] + " (" + d[options.pct_field] + ")"
    },
    replace_value_by_zero (
      show_value: boolean, 
      value: number
    ): number {
      if (show_value) {
        return value
      } else {
        return 0
      }
    },
    fn_in_interpol_functions: function (
      a: string, 
      b: string
    ): string {
      return "args " + a + " " + b
    },
    calc_proportion_by_month: function (
      dividendo: number, 
      divisor: number
    ): number {
      return dividendo / divisor / 12
    },
    calc_average_by_year: function (
      total1: number, 
      ano1: string, 
      total2: number, 
      ano2: string
    ): number {
      return (total2 - total1) / ((parseInt(ano2) - parseInt(ano1)) + 1)
    },
    calc_class_idh: function (
      idh: number, 
      showIdh: boolean = false, 
      showParentheses: boolean = false, 
      letterCaption: boolean = true
    ): string {
      let returText: string = ""
      if (idh < 0.5) {
        returText = letterCaption ? "Muito baixo" : "muito baixo"
      } else if (idh < 0.6) {
        returText = letterCaption ? "Baixo" : "baixo"
      } else if (idh < 0.7) {
        returText = letterCaption ? "Médio" : "médio"
      } else if (idh < 0.8) {
        returText = letterCaption ? "Alto" : "alto"
      } else {
        returText = letterCaption ? "Muito alto" : "muito alto"
      }
      returText = showParentheses ? " (" + returText + ")" : returText
      returText = showIdh ? idh + " " + returText : returText
      return returText
    },
    get_string_split: function (
      d: Record<string, string>, 
      str: string, 
      spltChar: string, 
      position: number
    ): string {
      return str.split(spltChar)[position].trim()
    },
    get_log_norm: function (
      d: Record<string, number>, 
      campo: string = "vl_indicador", 
      min: string = "minVal", 
      max: string = "maxVal"
    ): number {
      if (d[max] - d[min] == 0) {
        return Math.log10(1.5)
      } else {
        return Math.log10(((d[campo] - d[min]) / (d[max] - d[min]) + 1.0001))
      }
    },
    get_trunc: function (
      valor: number, 
      multiplier: number = 1
    ): number {
      return Math.trunc(valor * multiplier)
    },
    calc_subtraction: function (
      a: number, 
      b: number
    ): number {
      return a - b
    },
    calc_subtraction_ds: function (
      d: Record<string, number>, 
      a: number, 
      b: number
    ): number {
      return d[a] - d[b]
    },
    calc_addition_ds: function (
      d: Record<string, number>, 
      a: number, 
      b: number
    ): number {
      return a + b
    },
    calc_proportion_ds: function (
      d: Record<string, number>, 
      dividendo: number, 
      divisor: number
    ): number {
      return divisor == 0 ? null : dividendo / divisor
    },
    calc_percentage: function (
      parte: number, 
      total: number
    ): number {
      return parte / total * 100
    },
    calc_date_diff: function (
      dias: number, 
      data: Date = new Date()
    ): string {
      dias = (24 * 60 * 60 * 1000) * dias
      return new Date(data - dias).toISOString().substring(0, 10).replace(/-/g, "\\-")
    },
    format_scope: function (
      scope: number | string, 
      type: string = "month"
    ): string {
      const sc: string = typeof (scope) === "number" ? scope.toString() : scope
      if (type == "month" && sc.length == 6) {
        const months: string[] = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
        return months[parseInt(sc.substr(4, 2)) - 1] + " de " + sc.substr(0, 4)
      } else if (type == "year" && sc.length == 6) {
        return sc.substr(0, 4)
      } else {
        return sc
      }
    },
    format_month_ds: function (
      _d: Record<string, number>, 
      month_ym: number | string
    ): string {
      const ym: string = typeof (month_ym) === "number" ? month_ym.toString() : month_ym
      return ym.substr(4, 2) + "/" + ym.substr(0, 4)
    },
    format_quarter_ds: function (
      _d: Record<string, number>, 
      quarter_yq: number | string
    ): string {
      const yq: string = typeof (quarter_yq) === "number" ? quarter_yq.toString() : quarter_yq
      return yq.substr(5, 1) + "º Trimestre " + yq.substr(0, 4)
    }
  }

  // Injetar as funções no contexto global
  nuxtApp.provide("functions", functions)
})