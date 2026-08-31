import { colors } from '../../common-style/Palette';

export class OfferType {
	public label: string;
	public primaryColor: string;
	public secondaryColor: string;

	constructor(label: string, primaryColor: string, secondaryColor: string) {
		this.label = label;
		this.primaryColor = primaryColor;
		this.secondaryColor = secondaryColor;
	}
}

export function getOfferTypeData(id: number) {
	switch (id) {
		case 0:
			return new OfferType('offer.types.grant', colors.THEME_500, colors.THEME_50);
		case 1:
			return new OfferType('offer.types.storeCredit', colors.STATUS_DANGER_500, colors.DANGER_50);
		case 2:
			return new OfferType('offer.types.bogo', colors.WARNING_900, colors.WARNING_50);
		case 3:
			return new OfferType('offer.types.membershipFee', colors.GREEN, colors.THEME_50);
		case 4:
			return new OfferType('offer.types.freeEntry', colors.INFO_400, colors.INFO_50);
		case 5:
			return new OfferType('offer.types.freeProduct', colors.VIOLET, colors.FADED_VIOLET);
		default:
			return new OfferType('', colors.GREY_SCALE_7, colors.GREY_SCALE_O);
	}
}
