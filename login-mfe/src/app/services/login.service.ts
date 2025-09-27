import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, from } from 'rxjs';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, UserCredential } from 'firebase/auth';
import { app } from '../../environments/firebase.config';



export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private auth = getAuth(app);

    constructor(private http: HttpClient) { }

    // Firebase Authentication Login
    loginWithFirebase(email: string, password: string): Observable<UserCredential> {
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
            tap(userCredential => {
                // Store user token or user info in sessionStorage if needed
                sessionStorage.setItem('firebaseUser', JSON.stringify(userCredential.user));
            })
        );
    }

    // Firebase Authentication Register
    registerWithFirebase(email: string, password: string): Observable<UserCredential> {
        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
            tap(userCredential => {
                sessionStorage.setItem('firebaseUser', JSON.stringify(userCredential.user));
            })
        );
    }

    // Get current Firebase user
    getCurrentUser(): User | null {
        return this.auth.currentUser;
    }

    // Logout
    logout(): Promise<void> {
        sessionStorage.removeItem('firebaseUser');
        sessionStorage.removeItem('token');
        return this.auth.signOut();
    }
}
