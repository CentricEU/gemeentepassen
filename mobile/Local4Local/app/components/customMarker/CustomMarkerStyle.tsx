import { StyleSheet } from "react-native"
import { colors } from "../../common-style/Palette";

const styles = StyleSheet.create({
	markerContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.GREY_SCALE_900,
		borderRadius: 8
	},
	markerText: {
		color: colors.GREY_SCALE_O,
		margin: 4,
		paddingHorizontal: 4,
		fontWeight: 'bold',
	},
})
export default styles;
