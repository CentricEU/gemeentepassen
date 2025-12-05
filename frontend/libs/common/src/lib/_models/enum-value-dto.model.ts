export class EnumValueDto {
	key: string | number;
	value: string;

	constructor(key: string | number, value: string) {
		this.key = key;
		this.value = value;
	}
}
