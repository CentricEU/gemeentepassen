import {StyleSheet} from "react-native";
import {SEMI_BOLD} from "../../common-style/FontFamily";
import {colors} from "../../common-style/Palette";

const styles = StyleSheet.create({
	viewModeButton: {
		borderRadius: 8,
	},
	viewModeButtonLabel: {
		fontFamily: SEMI_BOLD,
		color: colors.GREY_SCALE_O,
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 24,
		marginLeft: 20,
		marginRight: 16,
		marginVertical: 8,
	},
});

export default styles;
