import {StyleSheet} from "react-native";
import {ITALIC} from "../../common-style/FontFamily";
import {colors} from "../../common-style/Palette";
import common from "../../common-style/CommonStyle";

const styles = StyleSheet.create({
	searchBarContainer: {
		height: 56,
		backgroundColor: colors.GREY_SCALE_O,
		paddingHorizontal: 16,
		flexDirection: 'row',
		gap: 16,
		overflow: 'visible',
		zIndex: 10,
		shadowColor: colors.DARK_BLUE,
		shadowOffset: {
			width: 1,
			height: 2,
		},
		shadowOpacity: 0.12,
		shadowRadius: 3,
		elevation: 2,
	},
	searchBar: {
		flexDirection: 'row-reverse',
		flex: 1,
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.GREY_SCALE_2,
		backgroundColor: colors.GREY_SCALE_O,
	},
	searchBarInput: {
		...common.clearDefaults,
		fontFamily: ITALIC,
		flex: 1,
		fontSize: 16,
		minHeight: 0,
		marginLeft: 4,
		color: colors.GREY_SCALE,
	},
	filterButton: {
		borderColor: colors.THEME_500,
		borderRadius: 8,
		width: 40,
		height: 40,
		padding: 0,
		margin: 0,
	}
});

export default styles;
