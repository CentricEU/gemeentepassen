import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineItem } from '@windmill/ng-windmill/timeline';

import { HistoryTimelineComponent } from './history-timeline.component';

describe('HistoryTimelineComponent', () => {
	let component: HistoryTimelineComponent;
	let fixture: ComponentFixture<HistoryTimelineComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [HistoryTimelineComponent],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(HistoryTimelineComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have an empty default data input', () => {
		expect(component.data()).toEqual([]);
	});

	it('should reflect updated data input', () => {
		const items: TimelineItem[] = [
			{
				header: 'Event 1',
				date: new Date('2024-01-01'),
				description: 'Desc 1',
				icon: 'info_b',
				isCurrent: false,
			},
			{
				header: 'Event 2',
				date: new Date('2024-02-01'),
				description: 'Desc 2',
				icon: 'check-circle_b',
				isCurrent: true,
			},
		];

		fixture.componentRef.setInput('data', items);
		fixture.detectChanges();

		expect(component.data()).toEqual(items);
		expect(component.data().length).toBe(2);
	});

	it('should render a centric-timeline element', () => {
		const compiled: HTMLElement = fixture.nativeElement;
		expect(compiled.querySelector('centric-timeline')).not.toBeNull();
	});
});
