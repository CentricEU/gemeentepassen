import { StyleSheet, TextStyle } from 'react-native';
import { colors } from '../../common-style/Palette';
import { generateTextStyles } from '../../common-style/Helpers';

const baseText = (size: number, lineHeight: number, color: string, weight: '400' | '600' | 'bold'): TextStyle => ({
	fontWeight: weight,
	...generateTextStyles(size, lineHeight),
	color,
	letterSpacing: 0,
	includeFontPadding: false,
	verticalAlign: 'middle'
});

const style = StyleSheet.create({
	// Active
	boldText: baseText(28, 18, colors.GREY_SCALE_7, '600'),
	totalAmountText: baseText(24, 16, colors.GREY_SCALE_7, '600'),
	expirationDateText: baseText(20, 14, colors.NEUTRAL, 'bold'),
	validUntilText: baseText(20, 14, colors.NEUTRAL, '400'),
	usageText: baseText(20, 14, colors.GREY_SCALE_7, '400'),
	percentageText: baseText(20, 14, colors.GREY_SCALE_7, '600'),
	remainingText: baseText(20, 14, colors.GREY_SCALE_7, '400'),

	// Disabled
	disabledBoldText: baseText(28, 18, colors.GREY_SCALE_300, '600'),
	disabledTotalAmountText: baseText(24, 16, colors.GREY_SCALE_300, '600'),
	disabledExpirationDateText: baseText(20, 14, colors.GREY_SCALE_300, 'bold'),
	disabledValidUntilText: baseText(20, 14, colors.GREY_SCALE_300, '400'),
	disabledUsageText: baseText(20, 14, colors.GREY_SCALE_300, '400'),
	disabledPercentageText: baseText(20, 14, colors.GREY_SCALE_300, '600'),
	disabledRemainingText: baseText(20, 14, colors.GREY_SCALE_300, '400'),

	// Layout
	content: {
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
		shadowColor: colors.WHITE,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3
	},
	headerContainerListView: { flexDirection: 'row' },
	cardBody: { flexDirection: 'column', width: '100%', gap: 4 },
	row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
	rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
	progressBar: { height: 8, borderRadius: 12 }
});

export default style;
