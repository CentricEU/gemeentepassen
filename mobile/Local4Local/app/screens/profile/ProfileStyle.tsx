import { StyleSheet } from "react-native"
import { colors } from "../../common-style/Palette";

const style = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.SURFACE_50
	},
	contentContainer: {
		alignItems: 'center',
		justifyContent: 'flex-start'
	},
	informationContainer: {
		justifyContent: 'center',
		marginVertical: 32,
		alignItems: 'center'
	},
	name: {
		fontSize: 20,
		fontWeight: "700",
		lineHeight: 32
	},
	balance: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: 14,
		fontWeight: "400",
		lineHeight: 24,
	},
	buttonsContainer: {
		alignItems: 'flex-start',
		width: '100%',
		padding: 16,
		gap: 24,
		color: colors.GREY_SCALE
	},
	headerTitleContainer: {
		alignSelf: 'flex-start'
	}
})
export default style;
