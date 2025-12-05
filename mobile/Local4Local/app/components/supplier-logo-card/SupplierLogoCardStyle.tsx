import {StyleSheet} from "react-native";
import {colors} from "../../common-style/Palette";

export const styles = StyleSheet.create({
	cardContainer: {
		width: 56,
		height: 56,
		marginTop: 4,
		padding: 4,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.GREY_SCALE_O,
		borderRadius: 8,
		overflow: 'visible',
		shadowColor: colors.DARK_BLUE,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.12,
		shadowRadius: 4,
		elevation: 5,
		zIndex: 10,
	},
	supplierLogo: {
		width: 44,
		height: 44,
		borderRadius: 4,
	}
});
