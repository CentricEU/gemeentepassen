import { StyleSheet } from "react-native";
import commonAuthStyle from "../../common-style/CommonAuthStyle";
import { colors } from "../../common-style/Palette";

const styles = StyleSheet.create({
	...commonAuthStyle,
	bottomContainer: {
		...commonAuthStyle.bottomContainer,
		alignSelf: 'center',
	},
	bottomText: {
		marginBottom: 12,
		color: colors.BLACK
	},
	forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginTop: -16,
        marginBottom: 32
    },
});

export default styles;
