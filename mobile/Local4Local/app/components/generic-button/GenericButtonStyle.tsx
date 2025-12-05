import {StyleSheet} from "react-native";
import {SEMI_BOLD} from "../../common-style/FontFamily";

const styles = StyleSheet.create({
	genericStyle: {
		borderRadius: 8,
		width: '100%',
		marginBottom: 12
	},


	buttonLabel: {
		fontFamily: SEMI_BOLD,
		fontWeight: '600',
		fontSize: 16,
		marginLeft: 20,
		marginRight: 16,
		marginVertical: 8,
	},
});

export default styles;
