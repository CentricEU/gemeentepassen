import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { TranslateService } from '@ngx-translate/core';
import { TimelineItem } from '@windmill/ng-windmill/timeline';
import { Observable } from 'rxjs';

import { AuditEventType } from '../../_enums/audit-event-type.enum';
import { AuditPropertyChangeDto } from '../../_models/audit-property-change-dto.model';
import { Environment } from '../../_models/environment.model';
import { TimelineEventDto } from '../../_models/timeline-event-dto.model';

@Injectable({
	providedIn: 'root',
})
export class TimelineService {
	public httpClient = inject(HttpClient);
	public translate = inject(TranslateService);

	private eventIcon = {
		APPLICATION_CREATED: 'plus_b',
		APPLICATION_CONFIRMED: 'envelope_b',
		APPLICATION_SUBMITTED: 'send_b',
		APPLICATION_REJECTED: 'cancel-circle_b',
		APPLICATION_APPROVED: 'check-circle_b',
		APPLICATION_APPROVED_WITH_EDITS: 'check-circle_b',
		INFORMATION_EDITED: 'edit-line_b',
	};

	private propertiesWithTranslations = ['category', 'subcategory', 'groupName', 'legalForm'];
	private readonly noValue = 'N/A';

	constructor(@Inject('env') private environment: Environment) {}

	public getSupplierTimeline(supplierId: string): Observable<TimelineEventDto[]> {
		return this.httpClient.get<TimelineEventDto[]>(`${this.environment.apiPath}/audit/timeline/${supplierId}`);
	}

	public mapAuditEventToTimelineItem(event: TimelineEventDto, isCurrent = false): TimelineItem {
		const title = this.t(`timeline.title.${event.eventType}`);

		const isApprovedWithoutChanges =
			event.changes.length === 0 &&
			[AuditEventType.APPLICATION_APPROVED, AuditEventType.APPLICATION_APPROVED_WITH_EDITS].includes(
				event.eventType,
			);
		const descriptionKey = isApprovedWithoutChanges
			? 'timeline.event.APPLICATION_APPROVED'
			: `timeline.event.${event.eventType}${event.changes.length > 1 ? '_MUL' : ''}`;

		let description = this.formatDate(event.timestamp) + '\n\n';

		description += this.t(descriptionKey, {
			actor: event.actorName,
			count: event.changes.length,
		});

		event.changes.forEach((change) => {
			description += '\n' + this.mapEventChangeToTimelineItemDescription(change);
		});

		return {
			header: title,
			date: event.timestamp,
			description: description,
			icon: this.eventIcon[event.eventType] || 'info_b',
			isCurrent,
		};
	}

	private mapEventChangeToTimelineItemDescription(change: AuditPropertyChangeDto): string {
		const { propertyName, oldValue, newValue } = change;
		const changedProperty = this.t(`timeline.property.${propertyName}`);

		if (propertyName === 'workingHours') {
			return `${changedProperty} ${this.t('timeline.defaultChangesPlural')}`;
		}

		if (propertyName === 'logo') {
			return `${changedProperty} ${this.t('timeline.defaultChangesSingular')}`;
		}

		if (propertyName === 'cashierEmail') {
			return this.t('timeline.newCashier', { newValue });
		}

		if (propertyName === 'subcategory' && oldValue === this.noValue) {
			const translatedNewValue = this.t(`timeline.${propertyName}.${newValue}`);
			return `${changedProperty} ${this.t('timeline.itemSet', { newValue: translatedNewValue })}`;
		}

		if (this.propertiesWithTranslations.includes(propertyName)) {
			const translatedOldValue = this.t(`timeline.${propertyName}.${oldValue}`);
			const translatedNewValue = this.t(`timeline.${propertyName}.${newValue}`);
			return `${changedProperty} ${this.t('timeline.itemChanged', { oldValue: translatedOldValue, newValue: translatedNewValue })}`;
		}

		if (oldValue === this.noValue) {
			return `${changedProperty} ${this.t('timeline.itemSet', { newValue })}`;
		}

		return `${changedProperty} ${this.t('timeline.itemChanged', { oldValue, newValue })}`;
	}

	private formatDate(date: Date): string {
		return new Date(date).toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});
	}

	private t(key: string, params?: object): string {
		return this.translate.instant(key, params);
	}
}
