import {StyleSheet} from "react-native";
import {REGULAR} from "../../common-style/FontFamily";
import {colors} from "../../common-style/Palette";

const styles = StyleSheet.create({
	generalButton: {
		borderRadius: 32,
		borderWidth: 1,
	},
	generalButtonContent: {},
	generalButtonLabel: {
		fontFamily: REGULAR,
		fontWeight: '600',
		fontSize: 14,
		lineHeight: 20,
		marginTop: 8,
		marginBottom: 8,
		marginLeft: 16,
		marginRight: 16,
		textAlignVertical: 'center',
		textAlign: 'center'
	},
	containedButton: {
		borderColor: colors.THEME_500,
	},
	containedButtonContent: {},
	containedButtonLabel: {
		color: colors.GREY_SCALE_O
	},
	outlinedButton: {
		borderColor: colors.GREY_SCALE_1,
		backgroundColor: colors.GREY_SCALE_O
	},
	outlinedButtonContent: {},
	outlinedButtonLabel: {
		color: colors.GREY_SCALE_7,
	},
	iconButtonLabel: {
		marginLeft: 24
	}
});

export default styles;
