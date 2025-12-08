import {StyleSheet} from "react-native";
import {colors} from "../../common-style/Palette";
import {SEMI_BOLD} from "../../common-style/FontFamily";

export const styles = StyleSheet.create({
	grantChipContainer: {
		alignItems: 'flex-start'
	},
	grantChip: {
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.GREY_SCALE,
		backgroundColor: colors.GREY_SCALE_O
	},
	grantChipLabel: {
		marginTop: 4,
		marginBottom: 4,
		marginRight: 8,
		marginLeft: 8,
		fontFamily: SEMI_BOLD,
		fontWeight: '600',
		color: colors.GREY_SCALE_7,
		lineHeight: 16,
		fontSize: 12,
	}
});
