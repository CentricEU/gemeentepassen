export class CommonUtil {
	public static hasValidValue(value: string): boolean {
		return value != null && value !== '';
	}

	public static isEnterOrSpace(key: string): boolean {
		return key === 'Enter' || key === ' ';
	}
}
