import { StyleSheet } from "react-native"
import { colors } from "../../common-style/Palette";

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		backgroundColor: colors.SURFACE_50,
		padding: 32
	},
	languageItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		height: 40
	},
	languageText: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		gap: 16,
	}
})
export default style;
