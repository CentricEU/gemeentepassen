import { SEMI_BOLD } from "../../common-style/FontFamily";
import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";

const style = StyleSheet.create({
	icon: {
		width: 24,
		height: 24,
	},
	buttonText: {
		color: colors.GREY_SCALE_O,
		fontFamily: SEMI_BOLD,
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
	},
	button: {
		borderRadius: 8,
		width: "100%",
		backgroundColor: colors.WALLET_BLACK,
		fontSize: 16,
		height: 36,
	}
});

export default style;
