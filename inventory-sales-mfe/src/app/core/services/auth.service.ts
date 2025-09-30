import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user$: Observable<firebase.User | null>;

    constructor(private afAuth: AngularFireAuth) {
        this.user$ = this.afAuth.authState;
    }

    // Login anônimo (mais simples para desenvolvimento)
    async signInAnonymously(): Promise<firebase.auth.UserCredential> {
        try {
            const result = await this.afAuth.signInAnonymously();
            console.log('Login anônimo realizado:', result.user?.uid);
            return result;
        } catch (error) {
            console.error('Erro no login anônimo:', error);
            throw error;
        }
    }

    // Login com email/senha
    async signInWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
        try {
            const result = await this.afAuth.signInWithEmailAndPassword(email, password);
            console.log('Login realizado:', result.user?.email);
            return result;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    // Criar conta
    async createUserWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
        try {
            const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
            console.log('Conta criada:', result.user?.email);
            return result;
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            throw error;
        }
    }

    // Logout
    async signOut(): Promise<void> {
        try {
            await this.afAuth.signOut();
            console.log('Logout realizado');
        } catch (error) {
            console.error('Erro no logout:', error);
            throw error;
        }
    }

    // Verificar se está logado
    getCurrentUser(): Promise<firebase.User | null> {
        return this.afAuth.currentUser;
    }

    // Obter token do usuário atual
    async getCurrentUserToken(): Promise<string | null> {
        const user = await this.getCurrentUser();
        if (user) {
            return await user.getIdToken();
        }
        return null;
    }
}
