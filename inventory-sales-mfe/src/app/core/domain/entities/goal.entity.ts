export interface Goal {
    id: string;
    title: string;
    description?: string;
    type: GoalType;
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    status: GoalStatus;
    productId?: string; // Para metas específicas de produto
    category?: string;  // Para metas por categoria
    createdAt: Date;
    updatedAt: Date;
}

export enum GoalType {
    SALES_REVENUE = 'sales_revenue',
    SALES_VOLUME = 'sales_volume',
    PRODUCTION_VOLUME = 'production_volume',
    PROFIT_MARGIN = 'profit_margin',
    CUSTOMER_ACQUISITION = 'customer_acquisition'
}

export enum GoalStatus {
    ACTIVE = 'active',
    ACHIEVED = 'achieved',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled'
}

export interface GoalProgress {
    goalId: string;
    progressPercentage: number;
    isAchieved: boolean;
    daysRemaining: number;
    estimatedCompletionDate?: Date;
    lastUpdated: Date;
}

export interface Notification {
    id: string;
    goalId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string;
}

export enum NotificationType {
    GOAL_ACHIEVED = 'goal_achieved',
    GOAL_WARNING = 'goal_warning', // 80% da meta atingida
    GOAL_OVERDUE = 'goal_overdue',
    GOAL_DEADLINE_APPROACHING = 'goal_deadline_approaching'
}
