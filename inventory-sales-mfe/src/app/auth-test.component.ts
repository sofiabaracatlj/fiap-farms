import { Component, OnInit } from '@angular/core';
import { SessionAuthService } from './core/services/session-auth.service';

@Component({
    selector: 'app-auth-test',
    template: `
        <div class="auth-test-container">
            <h2>Teste de Autenticação Firebase</h2>
            <div class="status">
                <p><strong>Status:</strong> {{ authStatus }}</p>
                <p><strong>Usuário Autenticado:</strong> {{ isAuthenticated ? 'Sim' : 'Não' }}</p>
                <p><strong>Token Presente:</strong> {{ hasToken ? 'Sim' : 'Não' }}</p>
                <p><strong>UID:</strong> {{ userUid || 'N/A' }}</p>
                <p><strong>Email:</strong> {{ userEmail || 'N/A' }}</p>
            </div>
            <div class="actions">
                <button (click)="checkAuth()">Verificar Autenticação</button>
                <button (click)="getToken()">Obter Token</button>
                <button (click)="reinitialize()">Reinicializar Auth</button>
                <button (click)="runDiagnostics()">Executar Diagnósticos</button>
            </div>
            <div class="logs" *ngIf="logs.length > 0">
                <h3>Logs:</h3>
                <div class="log-entry" *ngFor="let log of logs">{{ log }}</div>
            </div>
        </div>
    `,
    styles: [`
        .auth-test-container {
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
        }
        .status {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .actions {
            margin: 20px 0;
        }
        .actions button {
            margin: 5px;
            padding: 10px 15px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .actions button:hover {
            background: #0056b3;
        }
        .logs {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            max-height: 300px;
            overflow-y: auto;
        }
        .log-entry {
            margin: 5px 0;
            font-family: monospace;
            font-size: 12px;
        }
    `]
})
export class AuthTestComponent implements OnInit {
    authStatus = 'Verificando...';
    isAuthenticated = false;
    hasToken = false;
    userUid: string | null = null;
    userEmail: string | null = null;
    logs: string[] = [];

    constructor(private sessionAuthService: SessionAuthService) { }

    async ngOnInit() {
        await this.checkAuth();
    }

    async checkAuth() {
        try {
            this.addLog('Verificando status de autenticação...');

            this.isAuthenticated = await this.sessionAuthService.isAuthenticated();
            this.addLog(`Usuário autenticado: ${this.isAuthenticated}`);

            const userData = this.sessionAuthService.getUserFromSession();
            if (userData) {
                this.userUid = userData.uid;
                this.userEmail = userData.email;
                this.addLog(`Dados do usuário encontrados: UID=${this.userUid}, Email=${this.userEmail}`);
            } else {
                this.addLog('Nenhum dado de usuário encontrado no sessionStorage');
            }

            await this.getToken();

            this.authStatus = this.isAuthenticated ? 'Autenticado' : 'Não Autenticado';
        } catch (error) {
            this.addLog(`Erro ao verificar autenticação: ${error}`);
            this.authStatus = 'Erro';
        }
    }

    async getToken() {
        try {
            this.addLog('Obtendo token...');
            const token = await this.sessionAuthService.getCurrentUserToken();
            this.hasToken = !!token;

            if (token) {
                this.addLog(`Token obtido: ${token.substring(0, 50)}...`);
            } else {
                this.addLog('Nenhum token encontrado');
            }
        } catch (error) {
            this.addLog(`Erro ao obter token: ${error}`);
            this.hasToken = false;
        }
    }

    async reinitialize() {
        try {
            this.addLog('Reinicializando autenticação...');
            await this.sessionAuthService.initializeAuthFromSession();
            await this.checkAuth();
            this.addLog('Reinicialização concluída');
        } catch (error) {
            this.addLog(`Erro na reinicialização: ${error}`);
        }
    }

    async runDiagnostics() {
        try {
            this.addLog('Executando diagnósticos completos...');
            const diagnostics = await this.sessionAuthService.getAuthDiagnostics();
            this.addLog(`Diagnósticos executados - verifique o console para detalhes`);
            this.addLog(`Firebase User: ${diagnostics.firebaseUser ? diagnostics.firebaseUser.uid : 'null'}`);
            this.addLog(`Custom Data: ${diagnostics.customUserData ? 'presente' : 'ausente'}`);
            this.addLog(`Token Expirado: ${diagnostics.tokenStatus.isTokenExpired ? 'sim' : 'não'}`);
        } catch (error) {
            this.addLog(`Erro nos diagnósticos: ${error}`);
        }
    }

    private addLog(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.unshift(`[${timestamp}] ${message}`);

        // Manter apenas os últimos 50 logs
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(0, 50);
        }

        console.log(message);
    }
}
