import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";

const FONT_SIZE_SMALL = 16;
const FONT_COLOR_GREY = colors.GREY_SCALE_O;
const FONT_WEIGHT_BOLD = "bold";

const style = StyleSheet.create({
	discountCodePage: {
		backgroundColor: colors.SURFACE_50,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 30,
	},
	container: {
		flex: 1,
		alignItems: "center",
		marginTop: 8,
	},
	offerType: {
		fontSize: FONT_SIZE_SMALL,
		color: FONT_COLOR_GREY,
		marginBottom: 10,
	},
	expirationDate: {
		fontSize: FONT_SIZE_SMALL,
		color: FONT_COLOR_GREY,
		marginBottom: 20,
	},
	codeContainer: {
		backgroundColor: FONT_COLOR_GREY,
		paddingVertical: 10,
		paddingHorizontal: 60,
		borderRadius: 16,
		marginBottom: 10,
	},
	code: {
		fontSize: 28,
		color: colors.WHITE,
		fontWeight: FONT_WEIGHT_BOLD,
		textAlign: "center",
	},
	
	boldText: {
		color: FONT_COLOR_GREY,
		fontWeight: FONT_WEIGHT_BOLD,
	},
	buttonContainer: {
		backgroundColor: colors.SURFACE_50,
		position: "absolute",
		left: 12,
		right: 12,
		bottom: 0,
		paddingBottom: 8,
	},
});

export default style;
