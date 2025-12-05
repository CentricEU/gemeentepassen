import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";
const styles = StyleSheet.create({

	groupContainer: {
		height: 400,
		overflow: 'scroll',
		backgroundColor: colors.SURFACE_50
	},
	drawerBackground: {
		backgroundColor: colors.SURFACE_50
	},
	drawerHeader: {
		justifyContent: 'space-between',
		flexDirection: 'row',
		alignItems: 'center'
	},
	accordionTitle: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: '900'
	},
	accordionStyle: {
		marginTop: 10,
		marginHorizontal: 4,
		backgroundColor: colors.GREY_SCALE_O

	},
	bolderStyle: {
		fontWeight: '900'
	},
	detailsCard: {
		marginBottom: 4,
		marginHorizontal: 4,
		borderTopEndRadius: 0,
		borderTopStartRadius: 0
	}
});


export default styles;
