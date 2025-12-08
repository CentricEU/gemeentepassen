import { StyleSheet, TextStyle } from 'react-native';
import { colors } from '../../common-style/Palette';
import { generateTextStyles, BASE_UNIT, createCommonStyles } from '../../common-style/Helpers';

const styles = createCommonStyles({
	mainColor: colors.GREY_SCALE_O,
	secondaryColor: colors.GREY_SCALE_300,
	mainBackground: colors.GREY_SCALE_O,
	backgroundSurface: colors.SURFACE_50
});

const textStyles = {
	bold: styles.textBold,
	main: styles.mainColor,
	secondary: styles.secondaryColor,
	centered: styles.textCenter
};

const createTextStyle = (fontSize: number, lineHeight: number, colorStyle: TextStyle, extraStyles = {}) => ({
	...textStyles.bold,
	...createTextStyleWithoutBold(fontSize, lineHeight, colorStyle, extraStyles)
});

const createTextStyleWithoutBold = (fontSize: number, lineHeight: number, colorStyle: TextStyle, extraStyles = {}) => ({
	...generateTextStyles(fontSize, lineHeight),
	...colorStyle,
	...extraStyles
});

const createBoldTextStyle = (colorStyle: TextStyle) => ({
	...textStyles.bold,
	...colorStyle
});

const titleStyle = (style: TextStyle) =>
	createTextStyle(20, 20, style, {
		marginLeft: 8,
		flexShrink: 1
	});

const style = StyleSheet.create({
	offerType: {
		...textStyles.main,
		fontSize: BASE_UNIT,
		marginBottom: 10
	},
	offerTypeListView: createTextStyle(32, 20, textStyles.main),
	disabledOfferTypeListView: createTextStyle(32, 20, textStyles.secondary),

	boldText: createBoldTextStyle(textStyles.main),
	disabledBoldText: createBoldTextStyle(textStyles.secondary),
	enabled: {
		color: colors.GREY_SCALE_O
	},
	disabled: {
		color: colors.GREY_SCALE_300
	},
	codeContainer: {
		...styles.mainBackground,
		paddingVertical: 10,
		paddingHorizontal: 60,
		borderRadius: 16,
		marginBottom: 10,
		marginTop: 24
	},

	expirationDate: {
		fontSize: BASE_UNIT,
		marginBottom: 20,
		...textStyles.main
	},
	expirationDateListView: createTextStyle(20, 14, textStyles.main),
	disabledExpirationDateListView: createTextStyle(20, 14, textStyles.secondary),

	code: createTextStyle(48, 28, { color: colors.WHITE }, textStyles.centered),

	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 30
	},
	headerContainerListView: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16
	},

	footerText: createTextStyleWithoutBold(BASE_UNIT, BASE_UNIT, textStyles.main),
	disabledFooterText: createTextStyleWithoutBold(BASE_UNIT, BASE_UNIT, textStyles.secondary),

	content: {
		borderRadius: 8,
		padding: 16
	},

	title: titleStyle(textStyles.main),
	disabledTitle: titleStyle(textStyles.secondary),

	expirationDateContainer: {
		gap: 4,
		alignItems: 'flex-end'
	},
	detailsContainerListView: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	flexDirectionRow: {
		flexDirection: 'row'
	},
	offerTypeText: {
		flex: 1
	}
});

export default style;
