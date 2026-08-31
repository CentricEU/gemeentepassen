import { Component, inject, Input, OnInit } from '@angular/core';
import { TimelineService } from '@frontend/common';
import { TimelineItem } from '@windmill/ng-windmill/timeline';

@Component({
	selector: 'frontend-supplier-history',
	templateUrl: './supplier-history.component.html',
	styleUrls: ['./supplier-history.component.scss'],
	standalone: false,
})
export class SupplierHistoryComponent implements OnInit {
	@Input() public supplierId?: string;

	public timelineData: TimelineItem[] = [];

	public timelineService = inject(TimelineService);

	public ngOnInit(): void {
		this.initializeData();
	}

	public showTimeline(): boolean {
		return this.timelineData && this.timelineData.length > 0;
	}

	private initializeData(): void {
		if (!this.supplierId) {
			return;
		}

		this.timelineService.getSupplierTimeline(this.supplierId).subscribe((events) => {
			this.timelineData = events.map((event, index) =>
				this.timelineService.mapAuditEventToTimelineItem(event, index === 0),
			);
		});
	}
}
