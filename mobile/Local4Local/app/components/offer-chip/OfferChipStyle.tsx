import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";
import { SEMI_BOLD } from "../../common-style/FontFamily";

const styles = StyleSheet.create({
	offerChipContainer: {
		alignItems: "flex-start",
	},
	offerChip: {
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.GREY_SCALE,
		backgroundColor: colors.GREY_SCALE_O,
	},
	offerChipLabel: {
		marginTop: 4,
		marginBottom: 4,
		marginRight: 8,
		marginLeft: 8,
		fontFamily: SEMI_BOLD,
		fontWeight: "600",
		color: colors.GREY_SCALE_7,
		lineHeight: 16,
		fontSize: 12,
	},
});

export default styles;
