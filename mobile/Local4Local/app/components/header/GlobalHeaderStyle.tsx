import {Platform, StyleSheet} from "react-native";
import {colors} from "../../common-style/Palette";

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginRight: 12
	},
	backButton: {
		marginLeft: Platform.OS === 'android' ? 4 : 16,
		marginVertical: 8
	},
	headerTitleContainer: {
		alignItems: 'center',
		width: '50%'
	},
	headerTitle: {
		color: colors.GREY_SCALE_7
	},
	walletAmount: {
		color: colors.GREY_SCALE_500
	}
})
export default styles;
