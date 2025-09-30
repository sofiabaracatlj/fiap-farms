import { Component } from '@angular/core';

@Component({
    selector: 'app-investments',
    templateUrl: './investments.component.html',
    styleUrls: ['./investments.component.css']
})
export class InvestmentsComponent {
    totalValue: number = 15000; // Example total value
    fixedIncomeValue: number = 10000; // Example value for "Renda Fixa"
    variableIncomeValue: number = 5000; // Example value for "Renda Variável"

    investmentData = [
        { name: 'Renda Fixa', value: this.fixedIncomeValue },
        { name: 'Renda Variável', value: this.variableIncomeValue }
    ];
}
