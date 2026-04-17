import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoToolbarModule, PoButtonModule, PoModalModule, PoTableModule, PoModule, PoNotificationService, PoUploadLiterals, PoTableColumn, PoTableLiterals, PoModalComponent } from "@po-ui/ng-components";
import { environment } from '../environments/environment';

@Component({
  selector: 'app-tela-carga',
  imports: [PoToolbarModule, PoButtonModule, HttpClientModule, CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    PoModalModule,
    PoTableModule,
    PoModule,

  ],
  templateUrl: './tela-carga.html',
  styleUrl: './tela-carga.css',
})
export class TelaCarga {

    private router          = inject(Router)
    private srvNotification = inject(PoNotificationService)
    private formImport      = inject(FormBuilder);


    //Para não fixar a URL
    _url = environment.totvs_url + "/addFiles"

    //para nao fixar o Headers
    headersTotvs = environment.headersTotvsI

    //Variaveis 
    labelLoadTela: string = ''
    loadTela: boolean = false
    objSolic!: any[]

    customLiteralsupload: PoUploadLiterals = {
      dragFilesHere: 'Arraste o Arquivo aqui',
      selectFilesOnComputer: 'ou selecione o Arquivo no seu Computador',
      sentWithSuccess: 'Arquivo enviado com sucesso',
      startSending: 'Enviando Arquivo',
      errorOccurred: 'erro',
      selectFile: 'Buscar arquivo',
    }
    
    //---Grid
    alturaGrid: number = window.innerHeight - 270
    colunas!: PoTableColumn[]
    lista!: any[]
    customLiterals: PoTableLiterals = {
      noData: 'Importe os dados do Arquivo [v1.01]'
    }
  
    //Formulario
    public form = this.formImport.group({
      //codEstabel: ['', Validators.required],
      //codFilial: ['', Validators.required],
      //numRR: ['', Validators.required],
      //itCodigo: [''],
      //tpBusca: [2, Validators.required],
    })
  onManut(){

    this.router.navigate(['tela'])  

  }

  ChamaUploadOk(response: any) {

    this.srvNotification.success('Dados Carregados com sucesso !')
    
  }

  ChamaErro(event: any) {

    this.srvNotification.error("Erro ao Carregar o Arquivo ! ")

  }

  onCustomActionClick(file: any) {
    console.log(file)
  }

  onObterArquivo() {

    this.labelLoadTela = "Carregando Arquivo..."
    this.loadTela = true
    //let paramsTela: any = { items: this.form.value }
    /*FAS
    this.lista = []
    //Chamar o servico
    this.srvTotvs.ObterArquivo().subscribe({
      next: (response: any) => {
        this.srvNotification.success('Dados listados com sucesso !')
        this.lista = response.items
        this.poUpload.clear()
        this.lista.sort(this.srvTotvs.ordenarCampos(['iLinha']))
        this.lDisable=false
        this.loadTela = false

      },
      error: (e) => {
        this.srvNotification.error('Ocorreu um erro ObterArquivo: ' + e)
        this.loadTela = false
      },
    })
      FAS*/

  }

  onAlterarGrid(obj: any | null){

    /*FAS
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

}
