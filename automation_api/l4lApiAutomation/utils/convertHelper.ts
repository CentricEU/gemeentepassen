export class ConvertHelper {
	static convertValueToNumber(data: Array<Record<string, any>>, fieldName: string) {
		data.forEach((item) => {
			if (Object.prototype.hasOwnProperty.call(item, fieldName)) {
				if (item[fieldName] == null) return;
				item[fieldName] = Number(item[fieldName]);
			}
		});
	}
}
