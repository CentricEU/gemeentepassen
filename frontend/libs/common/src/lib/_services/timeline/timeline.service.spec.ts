import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

import { AuditEventType } from '../../_enums/audit-event-type.enum';
import { AuditPropertyChangeDto } from '../../_models/audit-property-change-dto.model';
import { Environment } from '../../_models/environment.model';
import { TimelineEventDto } from '../../_models/timeline-event-dto.model';
import { TimelineService } from './timeline.service';

describe('TimelineService', () => {
	let service: TimelineService;
	let httpMock: HttpTestingController;
	let translateService: TranslateService;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	} as Environment;

	const buildEvent = (
		eventType: AuditEventType,
		changes: AuditPropertyChangeDto[] = [],
		timestamp: Date = new Date('2024-01-15T10:30:00'),
		actorName = 'John Doe',
	): TimelineEventDto => {
		const event = new TimelineEventDto();
		event.eventType = eventType;
		event.timestamp = timestamp;
		event.actorName = actorName;
		event.changes = changes;
		return event;
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [{ provide: 'env', useValue: environmentMock }, TimelineService],
		});

		service = TestBed.inject(TimelineService);
		httpMock = TestBed.inject(HttpTestingController);
		translateService = TestBed.inject(TranslateService);

		jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[], params?: object) => {
			const keyStr = Array.isArray(key) ? key[0] : key;
			if (params) {
				return `${keyStr}(${JSON.stringify(params)})`;
			}
			return keyStr;
		});
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getSupplierTimeline', () => {
		it('should send a GET request and return TimelineEventDto[]', () => {
			const supplierId = 'supplier-123';
			const mockResponse: TimelineEventDto[] = [buildEvent(AuditEventType.APPLICATION_CREATED)];

			service.getSupplierTimeline(supplierId).subscribe((response) => {
				expect(response).toEqual(mockResponse);
			});

			const req = httpMock.expectOne(`${environmentMock.apiPath}/audit/timeline/${supplierId}`);
			expect(req.request.method).toBe('GET');
			req.flush(mockResponse);
		});
	});

	describe('mapAuditEventToTimelineItem', () => {
		it('should map a basic event with no changes to a TimelineItem', () => {
			const event = buildEvent(AuditEventType.APPLICATION_CREATED);
			const result = service.mapAuditEventToTimelineItem(event);

			expect(result.header).toBe(`timeline.title.${AuditEventType.APPLICATION_CREATED}`);
			expect(result.date).toBe(event.timestamp);
			expect(result.icon).toBe('plus_b');
			expect(result.isCurrent).toBe(false);
		});

			it('should set isCurrent to true when explicitly marked as current', () => {
				const event = buildEvent(AuditEventType.APPLICATION_APPROVED_WITH_EDITS);
				const result = service.mapAuditEventToTimelineItem(event, true);

			expect(result.isCurrent).toBe(true);
		});

			it('should set isCurrent to false by default', () => {
				const event = buildEvent(AuditEventType.APPLICATION_APPROVED_WITH_EDITS);
			const result = service.mapAuditEventToTimelineItem(event);

			expect(result.isCurrent).toBe(false);
		});

		it('should use singular description key when there is exactly one change', () => {
			const changes = [new AuditPropertyChangeDto('name', 'Old', 'New')];
			const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
			service.mapAuditEventToTimelineItem(event);

			expect(translateService.instant).toHaveBeenCalledWith(
				`timeline.event.${AuditEventType.INFORMATION_EDITED}`,
				expect.any(Object),
			);
		});

		it('should use plural description key (_MUL) when there are multiple changes', () => {
			const changes = [
				new AuditPropertyChangeDto('name', 'Old1', 'New1'),
				new AuditPropertyChangeDto('email', 'old@test.com', 'new@test.com'),
			];
			const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
			service.mapAuditEventToTimelineItem(event);

			expect(translateService.instant).toHaveBeenCalledWith(
				`timeline.event.${AuditEventType.INFORMATION_EDITED}_MUL`,
				expect.any(Object),
			);
		});

		it.each([
			[AuditEventType.APPLICATION_CREATED, 'plus_b'],
			[AuditEventType.APPLICATION_CONFIRMED, 'envelope_b'],
			[AuditEventType.APPLICATION_SUBMITTED, 'send_b'],
			[AuditEventType.APPLICATION_REJECTED, 'cancel-circle_b'],
			[AuditEventType.APPLICATION_APPROVED, 'check-circle_b'],
			[AuditEventType.APPLICATION_APPROVED_WITH_EDITS, 'check-circle_b'],
			[AuditEventType.INFORMATION_EDITED, 'edit-line_b'],
		])('should use icon "%s" for event type "%s"', (eventType, expectedIcon) => {
			const event = buildEvent(eventType);
			const result = service.mapAuditEventToTimelineItem(event);

			expect(result.icon).toBe(expectedIcon);
		});

		it('should fall back to "info_b" icon for unknown event types', () => {
			const event = buildEvent('UNKNOWN_TYPE' as AuditEventType);
			const result = service.mapAuditEventToTimelineItem(event);

			expect(result.icon).toBe('info_b');
		});

		it('should include formatted date in the description', () => {
			const event = buildEvent(AuditEventType.APPLICATION_CREATED);
			const result = service.mapAuditEventToTimelineItem(event);

			expect(result.description).toContain('15 Jan 2024');
		});

		describe('change descriptions', () => {
			it('should use default changes message for workingHours property', () => {
				const changes = [new AuditPropertyChangeDto('workingHours', 'old', 'new')];
				const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
				service.mapAuditEventToTimelineItem(event);

				expect(translateService.instant).toHaveBeenCalledWith('timeline.defaultChangesPlural', undefined);
			});

			it('should use newCashier message for cashierEmail property', () => {
				const newEmail = 'new@cashier.com';
				const changes = [new AuditPropertyChangeDto('cashierEmail', 'old@cashier.com', newEmail)];
				const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
				service.mapAuditEventToTimelineItem(event);

				expect(translateService.instant).toHaveBeenCalledWith('timeline.newCashier', { newValue: newEmail });
			});

			it('should use itemSet message for subcategory when oldValue is N/A', () => {
				const changes = [new AuditPropertyChangeDto('subcategory', 'N/A', 'FOOD')];
				const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
				service.mapAuditEventToTimelineItem(event);

				expect(translateService.instant).toHaveBeenCalledWith('timeline.subcategory.FOOD', undefined);
				expect(translateService.instant).toHaveBeenCalledWith(
					'timeline.itemSet',
					expect.objectContaining({ newValue: expect.any(String) }),
				);
			});

			it.each(['category', 'subcategory', 'groupName', 'legalForm'])(
				'should translate old and new values for "%s" property',
				(propertyName) => {
					const changes = [new AuditPropertyChangeDto(propertyName, 'OLD_VAL', 'NEW_VAL')];
					const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
					service.mapAuditEventToTimelineItem(event);

					expect(translateService.instant).toHaveBeenCalledWith(`timeline.${propertyName}.OLD_VAL`, undefined);
					expect(translateService.instant).toHaveBeenCalledWith(`timeline.${propertyName}.NEW_VAL`, undefined);
					expect(translateService.instant).toHaveBeenCalledWith('timeline.itemChanged', expect.any(Object));
				},
			);

			it('should use itemSet message when oldValue is N/A for non-subcategory property', () => {
				const changes = [new AuditPropertyChangeDto('name', 'N/A', 'Some Name')];
				const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
				service.mapAuditEventToTimelineItem(event);

				expect(translateService.instant).toHaveBeenCalledWith('timeline.itemSet', { newValue: 'Some Name' });
			});

			it('should use itemChanged message for regular property with old and new values', () => {
				const changes = [new AuditPropertyChangeDto('street', 'Old Street', 'New Street')];
				const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
				service.mapAuditEventToTimelineItem(event);

				expect(translateService.instant).toHaveBeenCalledWith('timeline.itemChanged', {
					oldValue: 'Old Street',
					newValue: 'New Street',
				});
			});

			it('should append all change descriptions to the result description', () => {
				const changes = [
					new AuditPropertyChangeDto('street', 'Old Street', 'New Street'),
					new AuditPropertyChangeDto('workingHours', 'old', 'new'),
				];
				const event = buildEvent(AuditEventType.INFORMATION_EDITED, changes);
				const result = service.mapAuditEventToTimelineItem(event);

				expect(result.description).toContain('timeline.property.street');
				expect(result.description).toContain('timeline.property.workingHours');
			});
		});
	});
});
