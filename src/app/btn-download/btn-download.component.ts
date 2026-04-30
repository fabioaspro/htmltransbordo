import { booleanAttribute, Component, inject, Input, OnInit } from '@angular/core';
import { environment } from '../environments/environment'
import { NgIf } from '@angular/common';
import { TotvsService46 } from '../services/totvs-service-46.service';

@Component({
    selector: 'btnDownload',
    templateUrl: './btn-download.component.html',
    styleUrl: './btn-download.component.css',
    standalone: true,
    imports: [NgIf]
})
export class BtnDownloadComponent {
  private srvTotvs46 = inject(TotvsService46)
  
  @Input() nomeArquivo: string='';
  @Input({transform: booleanAttribute}) mostrarNomeArquivo: boolean=true;
  
  urlSpool:string=''

  ngOnInit(): void {
    this.srvTotvs46.ObterCadastro({tabela: 'spool', codigo: ''}).subscribe({next: (response: any) => {this.urlSpool = response.desc}})
  }
}
