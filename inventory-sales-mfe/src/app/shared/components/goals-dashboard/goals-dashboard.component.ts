import { Component, OnInit } from '@angular/core';
// import { GoalsService } from '../../../core/application/services/goals.service';

interface GoalData {
    id: string;
    title: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    progress: number;
    color: 'green' | 'blue' | 'yellow' | 'red';
}

@Component({
    selector: 'app-goals-dashboard',
    templateUrl: './goals-dashboard.component.html',
    styleUrls: ['./goals-dashboard.component.css']
})
export class GoalsDashboardComponent implements OnInit {
    goals: GoalData[] = [
        {
            id: '1',
            title: 'Vendas Mensais',
            currentValue: 45000,
            targetValue: 60000,
            unit: 'R$',
            progress: 75,
            color: 'green'
        },
        {
            id: '2',
            title: 'Produção de Tomates',
            currentValue: 850,
            targetValue: 1000,
            unit: 'kg',
            progress: 85,
            color: 'blue'
        },
        {
            id: '3',
            title: 'Novos Clientes',
            currentValue: 12,
            targetValue: 20,
            unit: 'clientes',
            progress: 60,
            color: 'yellow'
        },
        {
            id: '4',
            title: 'Margem de Lucro',
            currentValue: 28,
            targetValue: 30,
            unit: '%',
            progress: 93,
            color: 'green'
        }
    ];

    overallProgress: number = 0;
    achievedGoalsCount: number = 0;
    isLoading: boolean = false;

    constructor() { }

    ngOnInit(): void {
        this.loadGoals();
        this.loadStatistics();
    }

    private loadGoals(): void {
        this.isLoading = true;

        // Using mock data for now until Firebase is properly configured
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    private loadStatistics(): void {
        this.overallProgress = this.getOverallProgress();
        this.achievedGoalsCount = this.getAchievedGoalsCount();
    }

    getOverallProgress(): number {
        if (this.goals.length === 0) return 0;
        const totalProgress = this.goals.reduce((sum, goal) => sum + goal.progress, 0);
        return Math.round(totalProgress / this.goals.length);
    }

    getAchievedGoalsCount(): number {
        return this.goals.filter(goal => goal.progress >= 100).length;
    }

    // Method to simulate initializing sample goals (for development)
    initializeSampleGoals(): void {
        this.isLoading = true;

        // Simulate API call
        setTimeout(() => {
            // Simulate updating some goal values
            this.goals[0].currentValue = 55000;
            this.goals[0].progress = Math.round((this.goals[0].currentValue / this.goals[0].targetValue) * 100);

            this.goals[1].currentValue = 950;
            this.goals[1].progress = Math.round((this.goals[1].currentValue / this.goals[1].targetValue) * 100);

            this.loadStatistics();
            this.isLoading = false;

            console.log('Sample goals updated with new values');
        }, 1500);
    }
}
