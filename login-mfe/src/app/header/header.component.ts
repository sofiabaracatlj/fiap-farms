import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    isMenuOpen = false;
    isModalOpen = false; // Track modal state
    faBars = faBars;
    isLogin = true; // Determines if the form is for login or registration

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    openModal(isLogin: boolean) {
        this.isLogin = isLogin;
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }
}
