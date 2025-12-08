import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";
import {
	generateTextStyles,
	BASE_UNIT,
	createCommonStyles,
} from "../../common-style/Helpers";

const styles = createCommonStyles({
	mainColor: colors.GREY_SCALE_900,
	secondaryColor: colors.GREY_SCALE_7,
	mainBackground: colors.GREY_SCALE_O,
	backgroundSurface: colors.SURFACE_50,
});

const style = StyleSheet.create({
	buttonContainer: {
		...styles.backgroundSurface,
		...styles.fullWidth,
		paddingTop: 24,
		paddingHorizontal: BASE_UNIT,
	},
	status: {
		...generateTextStyles(24, 16),
		...styles.textBold,
		...styles.secondaryColor,
		paddingBottom: 8,
		paddingHorizontal: BASE_UNIT,
	},
	cardsPage: {
		...styles.fullWidth,
		flexGrow: 1,
		paddingTop: BASE_UNIT,
		height: "100%",
	},
	cardsContainer: {
		...styles.backgroundSurface,
		flex: 1,
	},
	scrollContainer: {
		flexGrow: 1,
	},
	emptyStateContainer: {
		...styles.backgroundSurface,
		...styles.fullWidth,
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	emptyStateTitle: {
		...generateTextStyles(28, 18),
		...styles.mainColor,
		...styles.textBold,
		...styles.textCenter,
		paddingTop: 32,
		paddingBottom: 8,
	},
	emptyStateDescription: {
		...styles.mainColor,
		...styles.textCenter,
		...generateTextStyles(24, 16),
		fontSize: BASE_UNIT,
	},
	emptyStateDescriptionContainer: {
		paddingHorizontal: 50,
	},
	cardContainer: {
		...styles.mainBackground,
		...styles.fullWidth,
		height: "auto",
		padding: BASE_UNIT,
	},
});

export default style;
