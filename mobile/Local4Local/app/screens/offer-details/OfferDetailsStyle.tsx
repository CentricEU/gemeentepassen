import {StyleSheet} from "react-native";
import {colors} from "../../common-style/Palette";
import common from "../../common-style/CommonStyle";

export const styles = StyleSheet.create({
	offerDetailsPage: {
		backgroundColor: colors.SURFACE_50,
	},
	offerDetailsContent: {
		marginTop: 16,
		gap: 16
	},
	benefitList: {
		...common.clearDefaults,
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	getOfferButtonContainer: {
		backgroundColor: colors.SURFACE_50,
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 0,
		paddingBottom: 4
	}
});
