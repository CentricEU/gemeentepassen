import { Component, input } from '@angular/core';
import { TimelineItem } from '@windmill/ng-windmill/timeline';

@Component({
	selector: 'frontend-history-timeline',
	templateUrl: './history-timeline.component.html',
	styleUrl: './history-timeline.component.scss',
	standalone: false,
})
export class HistoryTimelineComponent {
	public data = input<TimelineItem[]>([]);
}
