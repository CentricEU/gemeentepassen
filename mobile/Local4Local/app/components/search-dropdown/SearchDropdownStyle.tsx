import { StyleSheet } from 'react-native';
import { colors } from '../../common-style/Palette';
import { BASE_UNIT, createCommonStyles } from '../../common-style/Helpers';

const common = createCommonStyles({
	mainColor: colors.THEME_500,
	secondaryColor: colors.GREY_SCALE,
	backgroundSurface: colors.SURFACE_50,
	mainBackground: colors.SURFACE_50
});

const styles = StyleSheet.create({
	searchResultsContainer: {
		...common.backgroundSurface,
		elevation: 4,
		...common.containerCenter,
		zIndex: 100,
		padding: BASE_UNIT,
		...common.fullWidth,
		height: '100%',
		alignSelf: 'flex-start'
	},
	getStartedText: {
		fontSize: 24,
		...common.textBold,
		marginBottom: BASE_UNIT,
		...common.textCenter,
		color: colors.GREY_SCALE_7
	},
	searchHistoryText: {
		fontSize: 14,
		marginTop: 4,
		...common.textCenter,
		color: colors.GREY_SCALE_7
	},
	historyTitle: {
		fontSize: 16,
		...common.textBold,
		alignSelf: 'flex-start',
		paddingBottom: 8
	},
	searchResultItem: {
		fontSize: BASE_UNIT,
		paddingVertical: BASE_UNIT - 2,
		alignSelf: 'flex-start'
	},
	searchHistoryItem: {
		fontSize: BASE_UNIT,
		paddingVertical: BASE_UNIT / 2,
		alignSelf: 'flex-start'
	},
	noHistoryText: {
		fontSize: 14,
		paddingVertical: 4
	},
	resultItemContainer: {
		alignSelf: 'flex-start',
		width: '100%'
	},
	gettingStarted: {
		flex: 1,
		justifyContent: 'center',
		...common.containerCenter,
		...common.fullWidth
	},
	keyboardAvoider: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%'
	}
});
export default styles;
