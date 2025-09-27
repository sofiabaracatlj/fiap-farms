import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CreateUserRequest, LoginService } from '../services/login.service';

@Component({
    selector: 'app-form-modal',
    templateUrl: './form-modal.component.html',
    styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent {
    @Input() isLogin = true; // Determines if the form is for login or registration
    @Output() closeModal = new EventEmitter<void>();

    errorMessage = '';

    nome = new FormControl('', { validators: [Validators.required, Validators.minLength(3)] });
    email = new FormControl('', { validators: [Validators.required, Validators.email] });
    password = new FormControl('', { validators: [Validators.required, Validators.minLength(6)] });

    constructor(private loginService: LoginService) { }

    onClose() {
        this.closeModal.emit();
    }

    onSubmit() {
        if (!this.isLogin && this.nome.invalid) {
            this.errorMessage = 'Por favor, insira um nome válido (mínimo 3 caracteres).';
            return;
        }

        if (this.email.invalid || this.password.invalid) {
            this.errorMessage = 'Por favor, insira um email válido e uma senha com pelo menos 6 caracteres.';
            return;
        }

        const nomeValue = this.nome.value ?? '';
        const emailValue = this.email.value ?? '';
        const passwordValue = this.password.value ?? '';

        if (this.isLogin) {
            console.log('Login:', { email: emailValue, password: passwordValue });
            // Use Firebase Authentication for login
            this.loginService.loginWithFirebase(emailValue, passwordValue).subscribe({
                next: (userCredential) => {
                    console.log('Login successful:', userCredential.user);
                    window.location.replace('/home');
                    this.onClose();
                },
                error: (error) => {
                    console.error('Login failed:', error);
                    this.errorMessage = this.getFirebaseErrorMessage(error.code);
                }
            });
        } else {
            // Use Firebase Authentication for registration
            this.loginService.registerWithFirebase(emailValue, passwordValue).subscribe({
                next: (userCredential) => {
                    console.log('User created successfully:', userCredential.user);
                    this.onClose();
                },
                error: (error) => {
                    console.error('User creation failed:', error);
                    this.errorMessage = this.getFirebaseErrorMessage(error.code);
                }
            });
        }
    }

    private getFirebaseErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'Usuário não encontrado.';
            case 'auth/wrong-password':
                return 'Senha incorreta.';
            case 'auth/email-already-in-use':
                return 'Este email já está em uso.';
            case 'auth/weak-password':
                return 'A senha deve ter pelo menos 6 caracteres.';
            case 'auth/invalid-email':
                return 'Email inválido.';
            case 'auth/too-many-requests':
                return 'Muitas tentativas. Tente novamente mais tarde.';
            case 'auth/operation-not-allowed':
                return 'Operação não permitida.';
            default:
                return 'Erro de autenticação. Tente novamente.';
        }
    }
}
