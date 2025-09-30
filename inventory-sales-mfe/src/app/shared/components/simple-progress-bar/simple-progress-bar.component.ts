import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-simple-progress-bar',
    template: `
    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div 
        class="h-2 rounded-full transition-all duration-500 ease-out"
        [class]="getProgressBarClass()"
        [style.width.%]="clampedProgress">
      </div>
    </div>
    <div class="flex justify-between text-xs text-gray-600" *ngIf="showLabels">
      <span>{{ label }}</span>
      <span>{{ clampedProgress }}%</span>
    </div>
  `,
    styles: []
})
export class SimpleProgressBarComponent {
    @Input() progress: number = 0;
    @Input() color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'indigo' = 'green';
    @Input() label: string = '';
    @Input() showLabels: boolean = false;

    get clampedProgress(): number {
        return Math.min(Math.max(this.progress, 0), 100);
    }

    getProgressBarClass(): string {
        const colorMap = {
            green: 'bg-green-500',
            blue: 'bg-blue-500',
            yellow: 'bg-yellow-500',
            red: 'bg-red-500',
            purple: 'bg-purple-500',
            indigo: 'bg-indigo-500'
        };
        return colorMap[this.color];
    }
}
