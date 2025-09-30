import { Component } from '@angular/core';

@Component({
    selector: 'app-side-bar-menu',
    template: `
        <div class="min-h-screen bg-white w-[180px] p-4 shadow-lg rounded-lg justify-center hidden lg:flex h-full">
            <app-menu [type]="'sideBar'"></app-menu>
        </div>
    `,
    styles: []
})
export class SideBarMenuComponent { }
