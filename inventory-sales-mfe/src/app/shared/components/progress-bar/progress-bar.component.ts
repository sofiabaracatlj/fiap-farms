import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent {
    @Input() title: string = '';
    @Input() progress: number = 0; // 0-100
    @Input() currentValue: number = 0;
    @Input() targetValue: number = 100;
    @Input() unit: string = '';
    @Input() color: 'green' | 'blue' | 'yellow' | 'red' = 'green';
    @Input() showPercentage: boolean = true;
    @Input() showValues: boolean = true;

    get progressPercentage(): number {
        return Math.min(Math.max(this.progress, 0), 100);
    }

    get progressBarClass(): string {
        const baseClass = 'h-3 rounded-full transition-all duration-300 ease-in-out';
        const colorClasses = {
            green: 'bg-green-500',
            blue: 'bg-blue-500',
            yellow: 'bg-yellow-500',
            red: 'bg-red-500'
        };
        return `${baseClass} ${colorClasses[this.color]}`;
    }

    get statusColor(): string {
        if (this.progress >= 100) return 'text-green-600';
        if (this.progress >= 80) return 'text-yellow-600';
        if (this.progress >= 50) return 'text-blue-600';
        return 'text-gray-600';
    }
}
