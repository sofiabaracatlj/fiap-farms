import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { SessionAuthService } from '../services/session-auth.service';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthInterceptor implements HttpInterceptor {

    constructor(private sessionAuthService: SessionAuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Só interceptar requisições para o Firebase
        if (req.url.includes('firestore.googleapis.com') || req.url.includes('firebase')) {
            console.log('FirebaseAuthInterceptor - Interceptando requisição Firebase:', req.url);

            return from(this.sessionAuthService.getCurrentUserToken()).pipe(
                switchMap(token => {
                    if (token) {
                        console.log('FirebaseAuthInterceptor - Adicionando token à requisição');
                        const authReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        return next.handle(authReq);
                    } else {
                        console.log('FirebaseAuthInterceptor - Nenhum token disponível');
                        return next.handle(req);
                    }
                }),
                catchError(error => {
                    console.error('FirebaseAuthInterceptor - Erro ao interceptar requisição:', error);
                    return next.handle(req);
                })
            );
        }

        return next.handle(req);
    }
}
