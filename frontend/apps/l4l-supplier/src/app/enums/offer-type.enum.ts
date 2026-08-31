export enum OfferTypeEnum {
	storeCredit = 1, // this is kept in case we'll need it back in the future, but for now is not used anymore
	bogo = 2,
	membershipFee = 3,
	freeEntry = 4,
	freeProduct = 5,
}

export const OfferTypeTranslations: Record<OfferTypeEnum, string> = {
	[OfferTypeEnum.storeCredit]: 'offer.types.storeCredit',
	[OfferTypeEnum.bogo]: 'offer.types.bogo',
	[OfferTypeEnum.membershipFee]: 'offer.types.membershipFee',
	[OfferTypeEnum.freeEntry]: 'offer.types.freeEntry',
	[OfferTypeEnum.freeProduct]: 'offer.types.freeProduct',
};
