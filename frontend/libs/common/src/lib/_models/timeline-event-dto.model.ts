import { AuditEventType } from '../_enums/audit-event-type.enum';
import { AuditPropertyChangeDto } from './audit-property-change-dto.model';

export class TimelineEventDto {
	eventType: AuditEventType;
	timestamp: Date;
	actorName: string;
	changes: AuditPropertyChangeDto[];
}
