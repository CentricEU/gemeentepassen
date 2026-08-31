import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditEventType, TimelineEventDto, TimelineService } from '@frontend/common';
import { TimelineItem } from '@windmill/ng-windmill/timeline';
import { of } from 'rxjs';

import { SupplierHistoryComponent } from './supplier-history.component';

describe('SupplierHistoryComponent', () => {
	let component: SupplierHistoryComponent;
	let fixture: ComponentFixture<SupplierHistoryComponent>;
	let timelineServiceMock: jest.Mocked<Pick<TimelineService, 'getSupplierTimeline' | 'mapAuditEventToTimelineItem'>>;

	const mockTimelineItem: TimelineItem = {
		header: 'Event',
		date: new Date('2024-01-01'),
		description: 'Desc',
		icon: 'info_b',
		isCurrent: false,
	};

	beforeEach(async () => {
		timelineServiceMock = {
			getSupplierTimeline: jest.fn(),
			mapAuditEventToTimelineItem: jest.fn().mockReturnValue(mockTimelineItem),
		};

		await TestBed.configureTestingModule({
			declarations: [SupplierHistoryComponent],
			providers: [{ provide: TimelineService, useValue: timelineServiceMock }],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierHistoryComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		timelineServiceMock.getSupplierTimeline.mockReturnValue(of([]));
		fixture.detectChanges();

		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should not call getSupplierTimeline when supplierId is not set', () => {
			fixture.detectChanges();

			expect(timelineServiceMock.getSupplierTimeline).not.toHaveBeenCalled();
			expect(component.timelineData).toEqual([]);
		});

		it('should load and map timeline data when supplierId is set', () => {
			const mockEvents: TimelineEventDto[] = [
				{
					eventType: AuditEventType.APPLICATION_CREATED,
					timestamp: new Date(),
					actorName: 'Actor',
					changes: [],
				},
			];
			timelineServiceMock.getSupplierTimeline.mockReturnValue(of(mockEvents));
			component.supplierId = 'supplier-123';

			fixture.detectChanges();

			expect(timelineServiceMock.getSupplierTimeline).toHaveBeenCalledWith('supplier-123');
			expect(timelineServiceMock.mapAuditEventToTimelineItem).toHaveBeenCalledWith(mockEvents[0], true);
			expect(component.timelineData).toEqual([mockTimelineItem]);
		});

		it('should map all returned events to timeline items', () => {
			const mockEvents: TimelineEventDto[] = [
				{
					eventType: AuditEventType.APPLICATION_CREATED,
					timestamp: new Date(),
					actorName: 'Actor',
					changes: [],
				},
				{
					eventType: AuditEventType.APPLICATION_APPROVED,
					timestamp: new Date(),
					actorName: 'Actor',
					changes: [],
				},
			];
			timelineServiceMock.getSupplierTimeline.mockReturnValue(of(mockEvents));
			component.supplierId = 'supplier-456';

			fixture.detectChanges();

			expect(component.timelineData.length).toBe(2);
			expect(timelineServiceMock.mapAuditEventToTimelineItem).toHaveBeenCalledTimes(2);
			expect(timelineServiceMock.mapAuditEventToTimelineItem).toHaveBeenNthCalledWith(1, mockEvents[0], true);
			expect(timelineServiceMock.mapAuditEventToTimelineItem).toHaveBeenNthCalledWith(2, mockEvents[1], false);
		});

		it('should set timelineData to empty array when supplier has no events', () => {
			timelineServiceMock.getSupplierTimeline.mockReturnValue(of([]));
			component.supplierId = 'supplier-789';

			fixture.detectChanges();

			expect(component.timelineData).toEqual([]);
		});
	});
});
