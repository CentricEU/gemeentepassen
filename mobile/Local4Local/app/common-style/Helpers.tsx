import { TextStyle, ViewStyle } from "react-native";

export const BASE_UNIT = 16;

interface CommonStyles {
	textCenter: TextStyle;
	textBold: TextStyle;
	mainColor: TextStyle;
	secondaryColor: TextStyle;
	containerCenter: ViewStyle;
	mainBackground: ViewStyle;
	backgroundSurface: ViewStyle;
	fullWidth: ViewStyle;
}

export const generateTextStyles = (
	lineHeight: number,
	fontSize: number
): TextStyle => ({
	lineHeight,
	fontSize,
});

export const createCommonStyles = (componentColors: {
	mainColor: string;
	secondaryColor: string;
	mainBackground: string;
	backgroundSurface: string;
}): CommonStyles => ({
	fullWidth: {
		width: "100%",
	},
	textCenter: {
		textAlign: "center",
	},
	textBold: {
		fontWeight: "bold",
	},
	mainColor: {
		color: componentColors.mainColor,
	},
	secondaryColor: {
		color: componentColors.secondaryColor,
	},
	containerCenter: {
		alignItems: "center",
	},
	mainBackground: {
		backgroundColor: componentColors.mainBackground,
	},
	backgroundSurface: {
		backgroundColor: componentColors.backgroundSurface,
	},
});
