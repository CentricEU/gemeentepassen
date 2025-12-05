import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";


const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		height: 40
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		gap: 8
	},
	buttonText: {
		color: colors.GREY_SCALE,
		fontSize: 16,
		fontWeight: '600',
		lineHeight: 24,
	}
});

export default styles;
