export class AuditPropertyChangeDto {
	propertyName: string;
	oldValue: string;
	newValue: string;

	constructor(propertyName: string, oldValue: string, newValue: string) {
		this.propertyName = propertyName;
		this.oldValue = oldValue;
		this.newValue = newValue;
	}
}
