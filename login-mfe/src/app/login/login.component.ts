import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  // styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showLoginForm: boolean = false;
  isRegistering: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.loginService.loginWithFirebase(this.email, this.password).subscribe({
      next: (userCredential) => {
        console.log('Login successful:', userCredential.user);
        this.isLoading = false;
        // Redirect to dashboard or home page
        // this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error.code);
      }
    });
  }

  onRegister() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.loginService.registerWithFirebase(this.email, this.password).subscribe({
      next: (userCredential) => {
        console.log('Registration successful:', userCredential.user);
        this.isLoading = false;
        // Redirect to dashboard or home page
        // this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error.code);
      }
    });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres';
      case 'auth/invalid-email':
        return 'Email inválido';
      default:
        return 'Erro de autenticação. Tente novamente.';
    }
  }
}
