import {StyleSheet} from "react-native"
import {colors} from "../../common-style/Palette"

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.GREY_SCALE,
	},
	mapOfferTypeSelector: {
		zIndex: 20,
		position: 'absolute',
		top: 52,
		marginTop: 16,
	},
	listOfferTypeSelector: {},
	viewModeButton: {
		zIndex: 20,
		position: 'absolute',
		right: 16,
		bottom: 16,
	}
})
export default styles;
