import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faPix } from '@fortawesome/free-brands-svg-icons';
import { faChartLine, faMoneyBillWave, faCreditCard, faShieldAlt, faHandHoldingDollar, faDonate, faMobileButton } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-other-services',
    templateUrl: './other-services.component.html',
    styleUrls: ['./other-services.component.css']
})
export class OtherServicesComponent {
    services = [
        { name: 'Empréstimos', icon: faHandHoldingDollar, href: '/home/services' },
        { name: 'Cartões', icon: faCreditCard, href: '/home/cards' },
        { name: 'Doações', icon: faDonate, href: '/home/services' },
        { name: 'Pix', icon: faPix, href: '/home/services' },
        { name: 'Seguros', icon: faShieldAlt, href: '/home/services' },
        { name: 'Crédito Celular', icon: faMobileButton, href: '/home/services' },
    ];
    constructor(private router: Router) { }

    navigate(href: string) {
        this.router.navigate([href]);
    }
}
