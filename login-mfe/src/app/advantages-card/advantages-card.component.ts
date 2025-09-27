import { Component, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-advantages-card',
    templateUrl: './advantages-card.component.html',
    styleUrls: ['./advantages-card.component.css']
})
export class AdvantagesCardComponent {
    @Input() icon!: IconDefinition; // FontAwesome icon class
    @Input() title!: string;
    @Input() description!: string;
}
