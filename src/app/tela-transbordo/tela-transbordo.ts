import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, NgZone, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router, ɵEmptyOutletComponent } from '@angular/router';
import { finalize, map, Subscription, timeInterval } from 'rxjs';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoWidgetModule, PoUploadComponent, PoModule, PoUploadFile, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals, PoTableComponent, PoUploadLiterals, PoModalComponent, PoInputComponent, PoComboModule, PoIconModule, PoLoadingModule, PoDialogModule, PoDialogAlertLiterals, PoDialogConfirmLiterals, PoAccordionModule } from '@po-ui/ng-components';
import { environment } from '../environments/environment'
import { ServerTotvsService } from '../services/server-totvs.service'
import { ExcelService } from '../services/excel-service.service'
import { DnRangeComponent } from "../dn-range/dn-range.component"
import { DnModal } from "../dn-modal/dn-modal";

@Component({
  selector: 'app-tela-transbordo',
  imports: [PoToolbarModule, ReactiveFormsModule, PoWidgetModule, FormsModule, PoPageModule, PoButtonModule,
    PoComboModule, PoIconModule, PoTableModule, PoModalModule, PoFieldModule, PoDividerModule, PoLoadingModule,
    PoModule,
    CommonModule,
    PoDialogModule,
    DnRangeComponent,
    CommonModule,
    PoAccordionModule,
    ReactiveFormsModule,
    FormsModule,
    PoModalModule,
    PoTableModule,
    PoModule,
    PoFieldModule,
    PoDividerModule,
    PoButtonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule, DnModal],
  templateUrl: './tela-transbordo.html',
  styleUrl: './tela-transbordo.css',
})
export class TelaTransbordo {

  constructor(private cdr:      ChangeDetectorRef) {}

  private srvDialog       = inject(PoDialogService)
  private srvTotvs        = inject(ServerTotvsService)
  private srvExcel        = inject(ExcelService)
  private srvNotification = inject(PoNotificationService)
  private formBuilder     = inject(FormBuilder)
  private router          = inject(Router)

  @ViewChild('telaFiltroAvancado', { static: true }) telaFiltroAvancado:  | PoModalComponent  | undefined
  @ViewChild('telaRPW', { static: true }) telaRPW:  | PoModalComponent  | undefined  
  @ViewChild('ChamaCadastro') telaCadastro!: PoModalComponent
  @ViewChild('ttDados') GridCadastro!: PoTableComponent

  labelLoadTela: string = ''
  loadTela:  boolean = false
  loadExcel: boolean = false

  //paginação do grid
  itensPaginados = []
  page = 1
  pageSize = 20
  disableShowMore = false

  //---ComboEstabelecimento
  codEstabelecimento: any
  placeHolderEstabelecimento!: string

  //---ComboItem
  codItem: any
  placeHolderItem!: string

  //---ComboEmitente
  codEmitente: any
  placeHolderEmitente!: string
  listaEmitente!: any[]
  loadEmitente: string = ''

  //--- Filtro Seleção
  estabelecimentoSelecionado:string = ''
  emitenteSelecionado:       string = ''
  ItemSelecionado:           string = ''

  codTecnico:     any
  listaTecnicos!: any[]
  loadTecnico:    string = ''  
  
  listaItens!:           any[]
  loadItem: string =''

  //ListasCombo
  listaEstabelecimentos!: any[]
  listaTransp!: any[]

  //---Grid
  colunas!: PoTableColumn[]
  lista!: any[]
  sub!: Subscription
  alturaGrid: number = window.innerHeight - 270
  listaSelecaoFiltrada:         any[] = []
  itensSelecionados: any[] = []

  //--Variáveis
  objSolic!: any[]
  showLoading = false
  cItCodigo!: string
  cDescItem!: string
  registroSelecionado: any = {}
  modoAlteracao = false
  modoInclusao  = false
  mostrarModal  = false
  linhaSelecionada: any
  mensagemModal = ''

  //Filtros Avançados
  filtro = {
    
    valEstabIni: "",
    valEstabFim: "ZZZ",
    cLabelCodEstabel: "Estabelecimento",

    valEmitIni: "0",
    valEmitFim: "999999999",
    cLabelCodEmit: 'Destino',

    valItemIni: "",
    valItemFim: "ZZ.ZZZ.ZZZZZ-ZZ",
    cLabelItem: "Item",    
    
  }

  filtroPadrao = {
    
    valEstabIni: "",
    valEstabFim: "ZZZ",
    cLabelCodEstabel: "Estabelecimento",

    valEmitIni: "0",
    valEmitFim: "999999999",
    cLabelCodEmit: 'Destino',

    valItemIni: "",
    valItemFim: "ZZ.ZZZ.ZZZZZ-ZZ",
    cLabelItem: "Item",    
    
  }

  get filtrosAlterados(): boolean {
    return JSON.stringify(this.filtro) !== JSON.stringify(this.filtroPadrao);
  }


  //Formulario
   public form = this.formBuilder.group({
    codEstabel:  [''],
    codEmit:     [''],
    codItem:     [''],    
  })

  //--- Actions
  readonly opcoes: PoTableAction[] = [
    {
      label: 'Alterar',
      icon: 'po-icon po-icon po-icon-edit',
      //action: this.onEditar.bind(this),
    },
    {
      label: 'Excluir',
      icon: 'bi bi-trash',
      //action: this.onEditar.bind(this),
    }];

  
  readonly acaoSalvar: PoModalAction = {
    label: 'Salvar',
    action: () => { //this.onSalvar() 
      }
  }

  readonly acaoCancelar: PoModalAction = {
    label: 'Cancelar',
    action: () => { //this.cadModal?.close()
       }
  }

  readonly acaoConfirmarFiltro: PoModalAction = {
    label: 'Aplicar',
    action: () => {
      this.telaFiltroAvancado?.close()
      this.ChamaObterDadosPag()
    },
   
    //disabled: !this.formAltera.valid,
  }

  readonly acaoCancelarFiltro: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaFiltroAvancado?.close()
    },
  }

  readonly acaoConfirmarRPW: PoModalAction = {
    label: 'Executar',
    action: () => {
      this.telaRPW?.close()
      this.ChamaObterDadosPag()
    },
   
  }

  readonly acaoCancelarRPW: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaRPW?.close()
    },
  }

  customLiterals: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados',
    loadMoreData: 'Carregar mais',
    loadingData: 'Buscar '
  }
  
  
public attListaItens(): void {

  console.log('Atualizando combo de itens');

  if (!this.listaSelecaoFiltrada || this.listaSelecaoFiltrada.length === 0) {
    this.listaItens = [{ label: 'Todos', value: null }];
    return;
  }

  const mapItens = new Map<string, any>();

  this.listaSelecaoFiltrada.forEach(item => {

    const codItem = item.codItem?.toString().trim();

    if (!codItem) return;

    if (!mapItens.has(codItem)) {
      mapItens.set(codItem, {
        label: `${codItem} - ${item.descItem?.trim() ?? ''}`,
        value: codItem
      });
    }
  });

  const itensOrdenados = Array
    .from(mapItens.values())
    .sort((a, b) => a.label.localeCompare(b.label));

  this.listaItens = [
    { label: 'Todos', value: null },
    ...itensOrdenados
  ];

  console.log('Itens carregados no combo:', this.listaItens);
}

onteste(){

      this.router.navigate(['teste'])

}

  //---Chama tela de Carga
  onCarga(){

    this.router.navigate(['carga'])

  }

  //--- Change Estabelecimentos - Popular Emitente
  public onEstabChange(obj: string) {

    if (obj === undefined || obj === "") {
      //---Zera as variáveis
      this.estabelecimentoSelecionado = ''
      this.listaSelecaoFiltrada = [...this.lista]
      this.filtrarLista()
      this.attListaItens()
      return
    }
    
    //---faz o que precisa
    this.estabelecimentoSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
    this.attListaItens()

  }

  //--- Limpar Filtros
  limparFiltros(){

    this.filtro = { ...this.filtroPadrao }

  }

  //--- Change Estabelecimentos - Popular Emitente
  public onItemChange(obj: string) {

    if (obj === undefined || obj === "") {
      //---Zera as variáveis
      this.ItemSelecionado = ''
      this.listaSelecaoFiltrada = [...this.lista]
      this.filtrarLista()
      this.attListaItens()
      return
    }
    
    //---faz o que precisa
    this.ItemSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
    // this.attListaItens()

  }

   //--- Change Emitente
  public onEmitenteChange(obj: string) {

    if (obj === undefined || obj === "") {
      //---Zera as variáveis
      this.emitenteSelecionado = ''
      this.listaSelecaoFiltrada = [...this.lista]
      this.filtrarLista()
      this.attListaItens()
      return
    }

    this.emitenteSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
    this.attListaItens()
  }
  //--- Change Emitente

  getRegistroVazio() {
    return {
      codEstabel: null,
      codEmitente: null,
      codItem: '',
      descItem: '',
      dtValidade: new Date(), // ✅ data de hoje
      lAtivo: true
    };
  }
  //--- Filtra Lista
  public filtrarLista() {
    
    this.listaSelecaoFiltrada = this.lista.filter(item => {
      const filtroEstabelecimento = this.estabelecimentoSelecionado ? item.codEstabel === this.estabelecimentoSelecionado: true
      const filtroEmitente        = this.emitenteSelecionado ? item.codEmitente === this.emitenteSelecionado: true
      const filtroItem            = this.ItemSelecionado ? item.codItem === this.ItemSelecionado: true

      return filtroEstabelecimento && filtroEmitente && filtroItem 
    })

  }

  //---Relatório no RPW
  onRPW() {
    this.telaRPW?.open()
  }

  public solicitarExclusao(row: any) {


    this.linhaSelecionada = row
    
    // Monte a mensagem usando os dados da linha
    this.mensagemModal = `<div class="confirm-msg">
                            <p>
                              Deseja realmente excluir o <strong>Transbordo</strong> abaixo?
                            </p>

                            <br>
                            <div class="confirm-box">
                              <div class="linha">
                                <span>Estabelecimento</span>
                                <strong>${row.codEstabel}</strong>
                              </div>

                              <div class="linha">
                                <span>Destino</span>
                                <strong>${row.codEmitente}</strong>
                              </div>

                              <div class="linha destaque">
                                <span>Item</span>
                                <strong>${row.codItem}</strong>
                              </div>
                            </div>

                          </div>
                          `
    this.mostrarModal     = true
  }

  public onConfirmarExclusao(confirmado: boolean){

    this.mostrarModal = false

    if (confirmado) {
      this.onExcluirSelLinha(this.linhaSelecionada)
    }

  }

  public onExcluirSelLinha(row: any): void {

    this.mostrarModal = false

    let paramsTela: any = { codEstabel: row.codEstabel, codEmitente: row.codEmitente, codItem: row.codItem}

    console.log(paramsTela)
    this.srvTotvs.onExcluirSel(paramsTela).subscribe({ 
      next: (response: any) => {

        if (response && response.items && response.items.length > 0) {
          
        }
        else {
          
        }

        this.srvNotification.success('Transbordo excluido com sucesso [Estabel: ' + row.codEstabel + " Destino: " + row.codEmitente + " Item: " + row.codItem + "]")

      },
      error: (e: any) => {
        this.loadTela = false
      }
    })
  
}

  public onExcluirSelecionados(): void {

    let registrosSelecionados = this.GridCadastro.getSelectedRows()

    //Verificar se existe algum registro selecionado, caso nao exista,
    //exibir msg para o usuario na tela

    if (this.GridCadastro.getSelectedRows().length > 0) {

      // ✅ monta params a partir do grid
      const paramsTela = registrosSelecionados.map((row: any) => ({
        codEstabel:  row.codEstabel,
        codEmitente: row.codEmitente,
        codItem:     row.codItem
      }))

      console.log(paramsTela)
      this.srvTotvs.onExcluirSel(paramsTela).subscribe({ 
        next: (response: any) => {
        
          console.log(response)
        
        },
        error: (e: any) => {
          this.loadTela = false
        },
        
      })

      this.srvNotification.success('Registros excluidos com sucesso!')

    }

    //Nenhum Registro selecionado no grid
    else this.srvNotification.error('Nenhum registro selecionado !');

  }

  public onAlterar(row: any){

    this.modoAlteracao = true

    // Clona os dados da linha
    this.registroSelecionado = { ...row, dtValidade: this.parseDate(row.dtValidade)}

    // Abre o modal
    this.onIncluir("Alteração")

  }

  public onIncluir(obj: any) {

    if (obj === "Inclusão"){
      this.registroSelecionado = this.getRegistroVazio()
      
      this.modoInclusao  = true
      this.modoAlteracao = false

    }
    else {
      this.modoInclusao  = false
      this.modoAlteracao = true
    }

    //Chamar a Tela de Detalhe passando o Processo como parametro 
    this.objSolic = obj
    let params = { CStatus: this.objSolic}
    
    this.telaCadastro.open()
      
  }
  
  public FecharChamaCadastro(): void {

    this.telaCadastro.close()

  }
  
  public Cadastro(): void {

    this.telaCadastro.close()

  }

   onAlterarGrid(obj: any | null){

    /*
    this.objSolic = obj.codItem
    this.linhaSelecionada = obj

    this.telaAltera?.open();

    if ((obj !== null) && (obj['$showAction'] !== undefined))
       delete obj['$showAction']

    if (obj !== null) {
      this.formAltera.patchValue(obj)
    }
    */
  }

  ngOnInit(): void {

    //Carregar combo de estabelecimentos
    
    this.listaEstabelecimentos = []

    this.placeHolderEstabelecimento = 'Aguarde, carregando lista...'
    this.placeHolderEmitente        = 'Aguarde, carregando lista...'
    this.placeHolderItem            = 'Aguarde, carregando lista...'

    this.srvTotvs.ObterEmitente().subscribe({
      next: (response: any) => {

        this.listaEmitente = response //(response as any[]).sort(this.ordenarCampos(['label']))

      },
      error:(e) => {

        this.srvNotification.error(e.message)
        return
        
      },
      complete: () => {

        this.placeHolderEmitente        = 'Selecione um destino'
        this.cdr.detectChanges()

      }

    })

    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {

        //Carrega combo com a lista de estabelecimentos
        this.listaEstabelecimentos = (response as any[]).sort(this.ordenarCampos(['label']))
        this.cdr.detectChanges()
      },
      error: (e) => {
        this.srvNotification.error(e.message)
        return
      },
      complete: () => {
      
        //Seta label dos combos
        this.placeHolderEstabelecimento = 'Selecione um estabelecimento'
        this.placeHolderItem            = 'Selecione um item'
        this.cdr.detectChanges()
      }

    })

    //Colunas do grid
    this.colunas = this.srvTotvs.obterColunas()
    this.ChamaObterDadosPag()
    this.attListaItens()
  }
  
  //Filtro Avançado
  onFiltroAvancado(){
    this.telaFiltroAvancado?.open()
  }

  //Listagem em Excel
  onExcel(){
    let titulo = "CADASTRO DE TRANSBORDO" //this.tituloTela.split(':')[0]
    let subTitulo = "LISTAGEM DE DADOS" //this.tituloTela.split(':')[1]
    this.loadExcel = true

    //let valorForm: any = { valorForm: this.form.value }

    this.srvExcel.exportarParaExcel('HTMLESRR033: ' + titulo.toUpperCase(),
      subTitulo.toUpperCase(),
      this.colunas,
      this.lista,
      'Transbordo',
      'Plan1')

    this.loadExcel = false
  }

  public ChamaDescItem(): void {

    this.showLoading = true
    let params: any = { CItCodigo: this.cItCodigo }
    this.srvTotvs.ObterDescItem(params).subscribe({
      
      next: (response: any) => {
        console.log("SUCESSO");
        console.log(response.items[0].DescItem);
        this.cDescItem = response.items[0].DescItem;
      },
      error: (e) => { //this.srvNotification.error("Ocorreu um erro na requisição");
       console.log("ERRO: ObterDescItem");
       return}
    })


    this.showLoading = false

  }

  ChamaObterDadosPag(){

    this.page     = 1
    this.pageSize = 80
    
    this.lista = []

    this.loadMoreItens()

  }

  loadMoreItens(){

    this.labelLoadTela = "Carregando Dados"
    this.loadTela = true
    //this.desabilitaForm()

    console.log(this.form.value)
    let paramsTela: any = { items: this.form.value, filtro: this.filtro, page: this.page, pageSize: this.pageSize }
   
    this.srvTotvs.ObterDadosPag(paramsTela).subscribe({
      next: (res: any) => {

        this.lista = this.page === 1 ? res.items : [...this.lista, ...res.items]
        this.listaSelecaoFiltrada = this.lista

        this.disableShowMore = res.items.length < this.pageSize
        this.page++

        this.loadTela = false
        this.cdr.detectChanges()
      },

      error: (err) => {
        
        this.loadTela = false
        this.cdr.detectChanges()

      },
      complete: () => {

        console.log("sel:" + this.emitenteSelecionado)
        this.filtrarLista()
        this.attListaItens()

      }
    })

  }

  //--- Função para ordenar
  //Utilize o - (menos) para indicar ordenacao descendente
  ordenarCampos = (fields: any[]) => (a: { [x: string]: number; }, b: { [x: string]: number; }) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o = o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
  }).reduce((p, n) => p ? p : n, 0)
  //--- Função para Ordenar

  //--- Função para converter string em data
  parseDate(data: string): Date | null {
    if (!data) return null;

    const partes = data.split('/');
    const dia = +partes[0];
    const mes = +partes[1] - 1;
    const ano = partes[2].length === 2 ? +('20' + partes[2]) : +partes[2];

    return new Date(ano, mes, dia);
  }

}
