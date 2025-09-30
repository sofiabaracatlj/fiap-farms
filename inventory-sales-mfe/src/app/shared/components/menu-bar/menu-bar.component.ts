import { Component } from '@angular/core';

@Component({
    selector: 'app-menu-bar',
    template: `
        <div class="justify-center w-full flex-row hidden lg:hidden md:flex py-4">
            <app-menu [type]="'menuBar'"></app-menu>
        </div>
    `,
    styles: []
})
export class MenuBarComponent { }
