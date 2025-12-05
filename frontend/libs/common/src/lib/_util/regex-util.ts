export class RegexUtil {
	public static onlyDigitsRegexPattern = new RegExp(/^\d*$/);

	public static numericalRegexPattern = new RegExp(/^[0-9]+(\[0-9]*){0,1}$/g);

	public static passwordRegexPattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');

	public static emailRegexPattern = new RegExp(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	);

	public static zipCodeRegexPattern = new RegExp(/^\d{4}(?:\s)?[A-Za-z]{2}$/);

	public static telephoneRegexPattern = new RegExp(/^\+31\d{9}$/);

	public static discountCodeRegexPattern = new RegExp(/^[A-Za-z0-9]{5}$/);

	public static urlRegexPattern = new RegExp(
		/^(?:(?:https?:)?\/\/)?(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}(?::[0-9]{1,5})?(?:\/[^\s]*)?$/
	  );			

	public static invoiceNumberRegexPattern = new RegExp(/^[a-zA-Z0-9/-]+$/);

	public static htmlContentRegexPattern = new RegExp(/[<>&]/);
}
