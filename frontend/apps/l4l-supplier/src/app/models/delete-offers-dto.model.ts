export class DeleteOffersDto {
	offersIds: string[];

	constructor(offersIds: (string | undefined)[]) {
		this.offersIds = offersIds.filter((id) => typeof id === 'string') as string[];
	}
}
