import { Component } from '@angular/core';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-burger-menu',
    templateUrl: './burger-menu.component.html',
})
export class BurgerMenuComponent {
    isOpen = false;
    faBars = faBars;
    faTimes = faTimes;

    toggleMenu() {
        this.isOpen = !this.isOpen;
    }
}
