import {StyleSheet} from "react-native";
import {REGULAR, SEMI_BOLD} from "../../common-style/FontFamily";
import {colors} from "../../common-style/Palette";

const styles = StyleSheet.create({
	detailsContainer: {
		flexDirection: 'row',
		marginTop: 16,
		alignItems: 'center'
	},
	detailsContainerForMap: {
		flexDirection: 'column',
		gap: 8,
		alignItems: 'flex-start'
	},
	locationTitle: {
		fontFamily: SEMI_BOLD,
		fontSize: 16,
		lineHeight: 24,
		flex: 1,
		color: colors.GREY_SCALE_7
	},
	locationDetails: {
		flexDirection: 'row',
		marginVertical: 2,
		gap: 4,
		alignItems: 'center'
	},
	locationStatus: {
		fontFamily: REGULAR,
		fontSize: 14,
		lineHeight: 20,
		color: colors.GREY_SCALE
	},
});

export default styles;
