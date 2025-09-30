import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Goal, GoalType, GoalStatus } from '../../domain/entities/goal.entity';
import { GoalRepository } from '../../domain/repositories/goal.repository';

@Injectable({
    providedIn: 'root'
})
export class FirestoreGoalRepository extends GoalRepository {

    constructor(private afs: AngularFirestore) {
        super();
    }

    findAll(): Observable<Goal[]> {
        return this.afs.collection('goals').valueChanges({ idField: 'id' }).pipe(
            map((goals: any[]) => goals.map(goal => this.convertTimestamps(goal)))
        );
    }

    findById(id: string): Observable<Goal | null> {
        return this.afs.doc(`goals/${id}`).valueChanges({ idField: 'id' }).pipe(
            map((goal: any) => {
                if (!goal) return null;
                return this.convertTimestamps(goal);
            })
        );
    }

    findByType(type: GoalType): Observable<Goal[]> {
        return this.afs.collection('goals', ref => ref.where('type', '==', type))
            .valueChanges({ idField: 'id' }).pipe(
                map((goals: any[]) => goals.map(goal => this.convertTimestamps(goal)))
            );
    }

    findByStatus(status: GoalStatus): Observable<Goal[]> {
        return this.afs.collection('goals', ref => ref.where('status', '==', status))
            .valueChanges({ idField: 'id' }).pipe(
                map((goals: any[]) => goals.map(goal => this.convertTimestamps(goal)))
            );
    }

    findActive(): Observable<Goal[]> {
        return this.findByStatus(GoalStatus.ACTIVE);
    }

    create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<Goal> {
        const now = new Date();
        const goalWithTimestamps = {
            ...goal,
            createdAt: now,
            updatedAt: now
        };

        return from(this.afs.collection('goals').add(goalWithTimestamps)).pipe(
            map(docRef => ({
                id: docRef.id,
                ...goalWithTimestamps
            } as Goal))
        );
    }

    update(id: string, goal: Partial<Goal>): Observable<Goal> {
        const updateData = {
            ...goal,
            updatedAt: new Date()
        };

        return from(this.afs.doc(`goals/${id}`).update(updateData)).pipe(
            map(() => ({ id, ...goal, updatedAt: new Date() } as Goal))
        );
    }

    delete(id: string): Observable<boolean> {
        return from(this.afs.doc(`goals/${id}`).delete()).pipe(
            map(() => true)
        );
    }

    updateProgress(goalId: string, currentValue: number): Observable<Goal> {
        return this.findById(goalId).pipe(
            map(goal => {
                if (!goal) throw new Error('Goal not found');

                const progress = (currentValue / goal.targetValue) * 100;
                const status = progress >= 100 ? GoalStatus.ACHIEVED : GoalStatus.ACTIVE;

                const updateData = {
                    currentValue,
                    status,
                    updatedAt: new Date()
                };

                this.afs.doc(`goals/${goalId}`).update(updateData);

                return {
                    ...goal,
                    currentValue,
                    status,
                    updatedAt: new Date()
                };
            })
        );
    }

    private convertTimestamps(goal: any): Goal {
        return {
            ...goal,
            startDate: this.toDate(goal.startDate),
            endDate: this.toDate(goal.endDate),
            createdAt: this.toDate(goal.createdAt),
            updatedAt: this.toDate(goal.updatedAt)
        };
    }

    private toDate(timestamp: any): Date {
        if (timestamp instanceof Date) {
            return timestamp;
        }
        if (timestamp && timestamp.toDate) {
            return timestamp.toDate();
        }
        return new Date();
    }
}