import {StyleSheet} from "react-native";
import {colors} from "../common-style/Palette";

const commonAuthStyle = StyleSheet.create({
	mainContainer: {
		flexGrow: 1,
		flexDirection: 'column'
	},
	linkTextContent: {
		display: "flex",
		flexDirection: "row",
		flexWrap: 'wrap',
		alignContent: 'center',
		justifyContent: 'center',
		alignItems: 'center',
	},
	linkText: {
		textAlign: 'center'
	},
	linkTextBottom: {
		display: "flex",
		flexDirection: "row",
		flexWrap: 'wrap',
		alignContent: 'center',
		justifyContent: 'center',
		marginTop: 12
	},
	hyperlinkClassic: {
		textDecorationLine: 'underline',
		color: colors.BLACK
	},
	hyperlinkAccent: {
		textDecorationLine: 'underline',
		color: colors.THEME_500,
	},
	titleContainer: {
		flexGrow: 2,
		display: 'flex',
		justifyContent: 'center',
	},
	formContainer: {
		flexGrow: 1,
		marginTop: 36,
		height: '100%',
		flexDirection: 'column',
	},
	buttonsContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column'
	},
	bottomContainer: {
		paddingTop: 32,
		marginBottom: 12,
		alignItems: 'center',
		justifyContent: 'center',
	}

});

export default commonAuthStyle;
