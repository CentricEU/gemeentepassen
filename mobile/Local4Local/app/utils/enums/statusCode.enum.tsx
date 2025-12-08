export enum StatusCode {
	// HTTP Errors
	NotFound = 404,
	BadRequest = 400,
	Unauthorized = 401,

	// Authentication Error Codes
	JwtExpired = 40017,
	InvalidCredentials = 40004,
	UserNotFound = 40006,
	AccountNotConfirmed = 40025,

    // DigiD error codes
	DigiDJwkError = 40043,
	DigiDBsnError = 40044,
	DigiDRequestError = 40045,
	DigiDUserDeactivated = 40046,

	// Validation & Constraints Error Codes
	UniqueConstraintViolated = 40005,
	CaptchaError = 40009,

	// Success Codes
	Ok = 200,
	Created = 201,
	NoContent = 204,
}
