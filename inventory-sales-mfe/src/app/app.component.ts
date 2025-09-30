import { Component, OnInit } from '@angular/core';
import { FirebaseInitializationService } from './core/services/firebase-initialization.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FIAP Farms - Inventory & Sales';

  constructor(private firebaseInitService: FirebaseInitializationService) { }

  async ngOnInit() {
    console.log('AppComponent - Inicializando aplicação');

    try {
      await this.firebaseInitService.initializeApp();
      console.log('AppComponent - Inicialização concluída');
    } catch (error) {
      console.error('AppComponent - Erro na inicialização:', error);
    }
  }
}
