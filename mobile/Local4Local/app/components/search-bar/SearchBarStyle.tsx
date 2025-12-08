import { StyleSheet } from 'react-native';
import { ITALIC } from '../../common-style/FontFamily';
import { colors } from '../../common-style/Palette';
import common from '../../common-style/CommonStyle';

const styles = StyleSheet.create({
	searchBarContainer: {
		height: 56,
		backgroundColor: colors.GREY_SCALE_O,
		paddingHorizontal: 16,
		paddingBottom: 16,
		gap: 16,
		flexDirection: 'row',
		alignItems: 'center',
		overflow: 'visible',
		zIndex: 10,
		shadowColor: colors.DARK_BLUE,
		shadowOffset: {
			width: 1,
			height: 2
		},
		shadowOpacity: 0.12,
		shadowRadius: 3,
		elevation: 2
	},
	searchBar: {
		flexDirection: 'row-reverse',
		flex: 1,
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.GREY_SCALE_2,
		backgroundColor: colors.GREY_SCALE_O,
		paddingRight: 4
	},
	searchBarInput: {
		...common.clearDefaults,
		fontFamily: ITALIC,
		flex: 1,
		fontSize: 16,
		minHeight: 0,
		color: colors.GREY_SCALE,
		paddingLeft: 4,
		paddingRight: 32
	},
	filterButton: {
		borderColor: colors.THEME_500,
		borderRadius: 8,
		width: 40,
		height: 40,
		padding: 0,
		margin: 0
	},
	clearButton: {
		position: 'absolute',
		right: 32,
		top: '50%',
		transform: [{ translateY: -25 }]
	},
	searchBarContainerFocused: {
		gap: 0,
		paddingLeft: 0
	}
});

export default styles;
