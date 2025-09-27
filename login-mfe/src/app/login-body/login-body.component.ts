import { Component, EventEmitter, Output } from '@angular/core';
import { faGift, faMobileScreen, faMoneyBillTransfer, faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-login-body',
    templateUrl: './login-body.component.html',
    styleUrls: ['./login-body.component.css']
})
export class LoginBodyComponent {
    @Output() openLogin = new EventEmitter<void>();

    faGift = faGift;
    faMoneyTransfer = faMoneyBillTransfer;
    faStar = faStar;
    faMobile = faMobileScreen;

    onOpenLogin() {
        this.openLogin.emit();
    }
}
