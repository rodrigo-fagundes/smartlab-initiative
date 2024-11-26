declare global {

  interface Smartlab {
    background_images: string[];
    observatories: Observatory[];
    footer: Footer;
    sections: Section[];
  }

  interface Observatory {
    id: string;
    blocked: boolean;
    title: string;
    short_title: string;
    short_desc: string;
    tooltip: string;
    hash_tag: string;
    to: string;
    external: boolean;
    rippleColor: string;
    dimensions: Dimension[];
    obsPage?: ObsPage;
    app_icon?: string;
    icon?: string;
    section_title?: string;
    section_description?: string;
    section_image?: string;
    section_background?: string;
    tagColor?: string;
    status?: string;
    media?: string;
    themeColor?: string;
    btnColor?: string;
  }

  interface Dimension {
    label: string;
    blocked: boolean;
    detail: string;
    tagColor: string;
    to: string;
    id: string;
    icon: string;
    short_desc: string;
    description: string;
    type: string;
    media: string;
    status?: string;
    default?: boolean;
    external?: boolean;
  }
        
  interface Footer {
    title: string;
    description: string;
    images: Image[];
  }

  interface Image {
    src: string;
    class: string;
    title: string;
    url: string;
    height?: string;
    maxHeight?: string;
    minHeight?: string;
  }

  interface Section {
    id: string;
    title: string;
    description: string;
    section_background: string;
    cls?: string;
    complement?: Complement;
  }

  interface Complement {
    cls: string;
    minicards: MiniCard[];
  }

  interface MiniCard {
    relevance: string;
    cls: string;
    args: Arg[];
    rowClass?: string;
    preloaded?: Preloaded;
    api?: CompositeText|CompositeText[];
    group?: string;
    api_reactive?: CompositeText|CompositeText[];
    reactive?: boolean;
  }

  interface Preloaded {
    prop: string;
    function: string;
    id: string;
    year: string;
    options?: DataOptions;
  }

  interface CompositeText {
    cls?: string;
    fixed?: string;
    template?: string;
    preloaded?: Preloaded;
    api?: CompositeText|CompositeText[];
    args?: Arg[];
    columns?: number;
    options?: DataOptions;
    api_options?: DataOptions;
  }

  interface DataOptions {
    recalc_min_max?: boolean;
    minmax_field?: string;
    recalc_sum?: RecalcSum;
    calcs?: Calc[]
    combine?: Combine[]
    formatters?: Formatters[]
    slice?: Slice
    melt?: Melt
    cast?: Cast
  }

  interface Cast {
    col_fields: string[];
    value_field?: string;
    layer_field?: string;
  }

  interface Melt {
    value_field: string;
    layer_fields: string[];
    layer_field: string;
    label_fields: string[];
    label_field: string;
    value_function?: string;
  }

  interface Formatters {
    id: string;
    format: string;
    precision?: number;
    multiplier?: number;
    collapse?: Collapse;
    signed?: boolean;
    uiTags?: boolean;
    null_value?: string;
    recalc_min_max?: boolean;
  }
  interface Combine {
    id: string;
    named_prop: string;
    desc: string;
    function: string;
    fn_args: Arg[];
    ds_agreg_primaria?: string;
    ds_agreg_secundaria?: string;
    ds_fonte?: string;
    format?: string;
    precision?: number;
    multiplier?: number;
    collapse?: Collapse;
    signed?: boolean;
    uiTags?: boolean;
  }

  interface Slice {
    id: string[]
  }

  interface RecalcSum {
    sum_field?: string;
  }

  interface Calc {
    id:       string;
    function: string;
    fn_args:  Arg[];
    recalc_min_max?: boolean;
    format?: string;
    precision?: number;
    multiplier?: number;
    collapse?: Collapse;
    signed?: boolean;
    uiTags?: boolean;
  }

  interface Arg {
    prop?: string;
    id?: string;
    base_object?: string;
    named_prop?: string;
    fixed?: string;
    template?: string;
    args?: Arg[];
    format?: string;
    precision?: number;
    multiplier?: number;
    collapse?: Collapse;
    signed?: boolean;
    uiTags?: boolean;
    default?: string|number;
    zero?: string;
    null_value?: string;
    function?: string;
    fn_args?: Arg[];
  }
  
  interface Collapse {
    format: string;
    precision?: number;
    multiplier?: number;
    signed?: boolean;
    uiTags?: boolean;
  }

  interface About {
    smartlab: AboutSmartlab;
    equipe: Team;
    licencas: Licenses;
  }
  
  interface AboutSmartlab {
    tab: string;
    title: string;
    sections: AboutSection[];
  }
  
  interface AboutSection {
    type: string;
    content?: string;
    title?: string;
    list_height?: string;
    list?: ListItem[];
  }
  
  interface ListItem {
    name: string;
    values: string[];
  }
  
  interface Team {
    tab: string;
    title: string;
    sections: AboutSection[];
  }
  
  interface Licenses {
    tab: string;
    title: string;
    sections: AboutSection[];
  }

  interface Place {
    id: number;
    label: string;
    scope: string;
    detail: string;
    icon: string;
    to: string;
    type: string;
    exclude_from: string[];
  }

  // ObsPage Interfaces
  interface ObsPage {
    map_image:         string;
    background_images: string[];
    tematicos:         string[];
    ranking_cards:     RankingCard[];
    prevalencia:       Prevalencia;
    sparklines:        Sparklines;
  }

  interface Prevalencia {
    id:                     string;
    title:                  CompositeText;
    title_comment?:         CompositeText;
    api:                    CompositeText|CompositeText[];
    chart_type:             string;
    chart_options:          MapBubblesChartOptions;
    source:                 Source;
    headers:                Header[];
    footer:                 TextItem[];
    main_title:             TextItem|RadioGroupItem|SelectItem|SwitchGroupItem|MinicardGroupItem|SliderItem[];
    info:                   TextItem|RadioGroupItem|SelectItem|SwitchGroupItem|MinicardGroupItem|SliderItem[];
    description:            TextItem|RadioGroupItem|SelectItem|SwitchGroupItem|MinicardGroupItem|SliderItem[];
    description_right?:     TextItem|RadioGroupItem|SelectItem|SwitchGroupItem|MinicardGroupItem|SliderItem[];
    description_bottom?:    TextItem|RadioGroupItem|SelectItem|SwitchGroupItem|MinicardGroupItem|SliderItem[];
    odometers?:             Odometers;
    default_group:          string;
    mapa_filtros:           TextItem|RadioGroupItem|SelectItem|SwitchGroupItem|MinicardGroupItem|SliderItem[];
    mapa_description_right: TextItem|RadioGroupItem|SelectItem|SwitchGroupItem|MinicardGroupItem|SliderItem[];
  }

  interface MapBubblesChartOptions {
    colorArray:        string[];
    indicadores:       string[];
    lat?:               string;
    long?:              string;
    id_field?:          string;
    value_field?:       string;
    tooltip_function?:  string;
    clickable?:         boolean;
    height_proportion?: number;
    radius?:            Radius;
    minZoom?:           number;
  }

  interface Radius {
    base:              number;
    multiplier:        number;
    tiles_url?:         string;
    tiles_attribution?: string;
  }

  interface Source {
    desc_field?: string;
    link_field?: string;
    desc?:       string;
    link?:       string;
  }

  interface Header {
    text:       string;
    value:      string;
    align?:      Align;
    width?:      Width;
    item_align?: Align;
    format?:    Format;
    type?:      string;
    series?:    string;
    bgColor?:   string;
    stroke?:    number;
  }

  interface TextItem {
    type:    "text";
    class?:   string;
    title?:    string;
    content: CompositeText;
  }

  interface MinicardGroupItem {
    id?:      string;
    type:     "minicards";
    class?:   string;
    rowClass?: string;
    cards?:   Minicard[];
  }

  interface RadioGroupItem {
    id?:      string;
    type:     "radio";
    class?:   string;
    cls?:     string;
    items?:   RadioItem[];
    event?:   string;
    content?: DescriptionContent;
  }

  interface RadioItem {
    id:         string;
    value:      string;
    cls?:       string;
    default?:   boolean;
    color?:      string;
    minicards?: Minicard[];
    api?:       CompositeText|CompositeText[];
    label?:     string;
  }

  interface SwitchGroupItem {
    id?:      string;
    type:     "switch-group";
    class?:   string;
    cls?:     string;
    switches?: SwitchItem[];
    event?:   string;
  }

  interface SwitchItem {
    id:         string;
    cls?:       string;
    default?:   boolean;
    color?:      string;
    minicards?: Minicard[];
    label?:     string;
    title?:     string;
  }

  interface SliderItem {
    id:            string;
    class:         string;
    type:          "slider";
    range?:        boolean;
    default?:      number;
    title?:        string;
    group?:        string;
    api?:          CompositeText|CompositeText[];
    args?:         Arg[];
    selection?:    SelectionRules;
  }

  interface SelectItem {
    id:            string;
    class:         string;
    type:          "select";
    title?:        string;
    label?:        string;
    group?:        string;
    parent?:       string;
    api?:          CompositeText|CompositeText[];
    api_reactive?: CompositeText|CompositeText[];
    args?:         Arg[];
    selection?:    SelectionRules;
    multiple?:     boolean;
    clearable?:    boolean;
    default?:      number|string;
    target?:       Topology;
  }

  interface SelectionRules {
    event: string;
    rules: Rules;
  }

  interface Rules {
    api:            CompositeText|CompositeText[];
    filter?:        string;
    suffix_params?: string;
    group?:         string;
  }

  interface Topology {
    scope: "uf"|"municipio"|"regic";
    range: "br"|"uf";
  }

  interface Odometers {
    title:            string;
    comment_title:    string;
    type:             string;
    odometer_items:   OdometerItem[];
    bg_color:         string;
    title_font_color: string;
  }

  interface OdometerItem {
    id:                string;
    title:             CompositeText;
    cls:               string;
    id_odometer:       string;
    show_pace?:        boolean;
    pace_description?: string;
    options:           OdometerItemOptions;
  }
  
  interface OdometerItemOptions {
    cls_format: string;
  }

  interface OdometerDataItem {
    cd_indicador: string;
    delta_por_ms: number;
    ds_indicador: string;
    momento_ms: number;
    nu_competencia_max: number;
    nu_competencia_max_ms: number;
    nu_competencia_min: number;
    nu_competencia_min_ms: number;
    vl_estimado: number;
    vl_indicador: number;
  }

  interface RankingCard {
    title:    string;
    cls:      string;
    group:    string;
    reactive: boolean;
    api:      CompositeText;
    args:     Arg[];
  }

  interface Sparklines {
    title:  TextItem[];
    footer: TextItem[];
    tables: SparklinesTable[];
  }

  interface SparklinesTable {
    id:             string;
    title:          string;
    cls:            string;
    id_field:       string;
    value_field:    string;
    series_field:   string;
    category_field: string;
    api:            CompositeText;
    headers:        Header[];
  }

}

// Este arquivo precisa ter pelo menos uma exportação vazia para ser tratado como um módulo.
export {}