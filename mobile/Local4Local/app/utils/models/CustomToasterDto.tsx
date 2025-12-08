export class CustomToasterDto {
	public key: string;
	public options?: any;

	constructor(key: string, options?: any) {
		this.key = key;
		this.options = options;
	}
}
