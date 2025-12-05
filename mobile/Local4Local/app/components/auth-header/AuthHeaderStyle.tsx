import {StyleSheet} from "react-native";
import {colors} from "../../common-style/Palette";


const styles = StyleSheet.create({
	titleContainer: {
		justifyContent: 'center',
		paddingTop: 56,
		paddingBottom: 32
	},
	mainTitle: {
		marginBottom: 12,
		fontWeight: '700',
		color: colors.BLACK
	},
	descriptionTitle: {
		color: colors.BLACK
	}
});

export default styles;
