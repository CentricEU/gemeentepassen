import { StyleSheet } from "react-native";
import commonAuthStyle from "../../common-style/CommonAuthStyle";

const styles = StyleSheet.create({
	...commonAuthStyle,
	buttonsContainer: {
		...commonAuthStyle.buttonsContainer
	},
	formContainer: {
		marginTop: 0
	},
});

export default styles;
