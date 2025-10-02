import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-inventory-page',
    templateUrl: './inventory-page.component.html',
    styleUrls: ['./inventory-page.component.css']
})
export class InventoryPageComponent {

    constructor(private location: Location) { }

    goBack(): void {
        this.location.back();
    }
}
