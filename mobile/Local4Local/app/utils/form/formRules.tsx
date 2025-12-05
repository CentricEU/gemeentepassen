export const customEmailPatternRule = (condition: boolean, messageText: string) =>
	condition
		? {
			pattern: {
				value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
				message: messageText
			},
		}
		: {};

export const confirmPasswordMatchRule = (condition: boolean, fieldNameToMatch: string, messageText: string) =>
	condition
		? {
			validate: (value: string, allValue: any) => {
				const fieldValueToMatch = allValue[fieldNameToMatch];

				if (value === fieldValueToMatch) {
					return true;
				}

				return messageText;
			},
		}
		: {};

export const customPasswordPatternRule = (condition: boolean, messageText: string) =>
	condition
		? {
			pattern: {
				value: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/,
				message: messageText
			},
		}
		: {};
