import { Injectable, NgZone } from '@angular/core';
import { SessionAuthService } from '../services/session-auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
    providedIn: 'root'
})
export class FirebaseInitializationService {

    constructor(
        private sessionAuthService: SessionAuthService,
        private afAuth: AngularFireAuth,
        private ngZone: NgZone
    ) { }

    async initializeApp(): Promise<void> {
        console.log('FirebaseInitializationService - Inicializando aplicação');

        try {
            // 1. Configurar persistência de autenticação
            await this.configurePersistence();

            // 2. Verificar e restaurar autenticação do sessionStorage
            await this.sessionAuthService.initializeAuthFromSession();

            // 3. Se não há usuário autenticado, fazer login anônimo como fallback
            const currentUser = await this.afAuth.currentUser;
            if (!currentUser) {
                console.log('FirebaseInitializationService - Nenhum usuário autenticado, fazendo login anônimo');
                await this.sessionAuthService.signInAnonymously();
            }

            console.log('FirebaseInitializationService - Aplicação inicializada com sucesso');
        } catch (error) {
            console.error('FirebaseInitializationService - Erro ao inicializar aplicação:', error);

            // Como último recurso, tentar login anônimo
            try {
                await this.sessionAuthService.signInAnonymously();
                console.log('FirebaseInitializationService - Login anônimo realizado como fallback');
            } catch (anonymousError) {
                console.error('FirebaseInitializationService - Erro no login anônimo:', anonymousError);
            }
        }
    }

    private async configurePersistence(): Promise<void> {
        try {
            // Configurar persistência local para manter o usuário logado
            await this.afAuth.setPersistence('local');
            console.log('FirebaseInitializationService - Persistência configurada');
        } catch (error) {
            console.error('FirebaseInitializationService - Erro ao configurar persistência:', error);
        }
    }

    // Método para verificar o status de autenticação
    async getAuthStatus(): Promise<{
        isAuthenticated: boolean;
        user?: any;
        source: 'firebase' | 'session' | 'none';
    }> {
        try {
            // Verificar Firebase Auth
            const firebaseUser = await this.afAuth.currentUser;
            if (firebaseUser) {
                return {
                    isAuthenticated: true,
                    user: firebaseUser,
                    source: 'firebase'
                };
            }

            // Verificar sessionStorage
            const sessionKeys = Object.keys(sessionStorage);
            const firebaseKey = sessionKeys.find(key => key.includes('firebase:authUser'));

            if (firebaseKey) {
                const authData = sessionStorage.getItem(firebaseKey);
                if (authData) {
                    const userData = JSON.parse(authData);

                    // Verificar se o token ainda é válido
                    const expirationTime = userData.stsTokenManager?.expirationTime;
                    const currentTime = Date.now();

                    if (expirationTime && currentTime < expirationTime) {
                        return {
                            isAuthenticated: true,
                            user: userData,
                            source: 'session'
                        };
                    }
                }
            }

            return {
                isAuthenticated: false,
                source: 'none'
            };
        } catch (error) {
            console.error('FirebaseInitializationService - Erro ao verificar status de autenticação:', error);
            return {
                isAuthenticated: false,
                source: 'none'
            };
        }
    }
}
