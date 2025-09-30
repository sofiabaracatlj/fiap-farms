import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Goal, GoalType, GoalStatus } from '../../domain/entities/goal.entity';
import { GoalRepository } from '../../domain/repositories/goal.repository';
import { FirestoreGoalRepository } from '../../infrastructure/repositories/firestore-goal.repository';

@Injectable({
    providedIn: 'root'
})
export class GoalsService {
    private goalRepository: GoalRepository;

    constructor(private firestoreGoalRepository: FirestoreGoalRepository) {
        this.goalRepository = firestoreGoalRepository;
    }

    // Get all active goals
    getActiveGoals(): Observable<Goal[]> {
        return this.goalRepository.findActive();
    }

    // Get goals with progress calculation
    getGoalsWithProgress(): Observable<any[]> {
        return this.getActiveGoals().pipe(
            map(goals => goals.map(goal => ({
                id: goal.id,
                title: goal.title,
                currentValue: goal.currentValue,
                targetValue: goal.targetValue,
                unit: goal.unit,
                progress: this.calculateProgress(goal.currentValue, goal.targetValue),
                color: this.getColorForGoalType(goal.type),
                status: goal.status
            })))
        );
    }

    // Create a new goal
    createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<Goal> {
        return this.goalRepository.create(goalData);
    }

    // Update goal progress
    updateGoalProgress(goalId: string, currentValue: number): Observable<Goal> {
        return this.goalRepository.updateProgress(goalId, currentValue);
    }

    // Get overall progress of all goals
    getOverallProgress(): Observable<number> {
        return this.getGoalsWithProgress().pipe(
            map(goals => {
                if (goals.length === 0) return 0;
                const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
                return Math.round(totalProgress / goals.length);
            })
        );
    }

    // Get count of achieved goals
    getAchievedGoalsCount(): Observable<number> {
        return this.getGoalsWithProgress().pipe(
            map(goals => goals.filter(goal => goal.progress >= 100).length)
        );
    }

    // Initialize sample goals for development
    initializeSampleGoals(): Observable<Goal[]> {
        const sampleGoals = [
            {
                title: 'Vendas Mensais',
                description: 'Meta de faturamento mensal da fazenda',
                type: GoalType.SALES_REVENUE,
                targetValue: 60000,
                currentValue: 45000,
                unit: 'R$',
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                status: GoalStatus.ACTIVE
            },
            {
                title: 'Produção de Tomates',
                description: 'Meta de produção mensal de tomates',
                type: GoalType.PRODUCTION_VOLUME,
                targetValue: 1000,
                currentValue: 850,
                unit: 'kg',
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                status: GoalStatus.ACTIVE
            },
            {
                title: 'Novos Clientes',
                description: 'Captação de novos clientes mensais',
                type: GoalType.CUSTOMER_ACQUISITION,
                targetValue: 20,
                currentValue: 12,
                unit: 'clientes',
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                status: GoalStatus.ACTIVE
            },
            {
                title: 'Margem de Lucro',
                description: 'Meta de margem de lucro mensal',
                type: GoalType.PROFIT_MARGIN,
                targetValue: 30,
                currentValue: 28,
                unit: '%',
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                status: GoalStatus.ACTIVE
            }
        ];

        const createPromises = sampleGoals.map(goal => this.createGoal(goal));
        return new Observable(observer => {
            Promise.all(createPromises.map(obs => obs.toPromise())).then(goals => {
                observer.next(goals.filter((goal): goal is Goal => goal !== undefined));
                observer.complete();
            }).catch(error => {
                observer.error(error);
            });
        });
    }

    private calculateProgress(currentValue: number, targetValue: number): number {
        if (targetValue === 0) return 0;
        return Math.min(Math.round((currentValue / targetValue) * 100), 100);
    }

    private getColorForGoalType(type: GoalType): 'green' | 'blue' | 'yellow' | 'red' {
        switch (type) {
            case GoalType.SALES_REVENUE:
                return 'green';
            case GoalType.PRODUCTION_VOLUME:
                return 'blue';
            case GoalType.CUSTOMER_ACQUISITION:
                return 'yellow';
            case GoalType.PROFIT_MARGIN:
                return 'green';
            default:
                return 'blue';
        }
    }
}
