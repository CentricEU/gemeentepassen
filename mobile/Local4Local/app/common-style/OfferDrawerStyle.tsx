import { StyleSheet } from "react-native";
import { colors } from "./Palette";
const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'transparent'
	},
	drawer: {
		backgroundColor: colors.GREY_SCALE_O,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 20
	}
});


export default styles;
