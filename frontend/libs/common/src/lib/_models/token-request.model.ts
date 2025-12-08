export class TokenRequest {
	public tokenId: string;
	public accessToken: string;

	constructor(tokenId: string, accessToken: string) {
		this.tokenId = tokenId;
		this.accessToken = accessToken;
	}
}
