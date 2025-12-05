import { StyleSheet } from "react-native"
import { colors } from "../../common-style/Palette";

const style = StyleSheet.create({
	container: {
		backgroundColor: colors.SURFACE_50,
		flexGrow: 1,
		paddingHorizontal: 20,
		flexDirection: 'column',
		justifyContent: "space-between"
	},
	formContainer: {
		marginTop: 12,
		gap: 12,
		flexDirection: 'column',
	}

})
export default style;
