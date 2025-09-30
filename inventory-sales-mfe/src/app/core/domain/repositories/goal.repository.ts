import { Observable } from 'rxjs';
import { Goal, GoalProgress, Notification, GoalType, GoalStatus } from '../entities/goal.entity';

export abstract class GoalRepository {
    abstract findAll(): Observable<Goal[]>;
    abstract findById(id: string): Observable<Goal | null>;
    abstract findByType(type: GoalType): Observable<Goal[]>;
    abstract findByStatus(status: GoalStatus): Observable<Goal[]>;
    abstract findActive(): Observable<Goal[]>;
    abstract create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<Goal>;
    abstract update(id: string, goal: Partial<Goal>): Observable<Goal>;
    abstract delete(id: string): Observable<boolean>;
    abstract updateProgress(goalId: string, currentValue: number): Observable<Goal>;
}

export abstract class NotificationRepository {
    abstract findAll(): Observable<Notification[]>;
    abstract findByGoalId(goalId: string): Observable<Notification[]>;
    abstract findUnread(): Observable<Notification[]>;
    abstract create(notification: Omit<Notification, 'id'>): Observable<Notification>;
    abstract markAsRead(id: string): Observable<boolean>;
    abstract markAllAsRead(): Observable<boolean>;
    abstract delete(id: string): Observable<boolean>;
}
