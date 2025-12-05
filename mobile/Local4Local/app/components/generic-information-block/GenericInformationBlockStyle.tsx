import {StyleSheet} from "react-native";
import {colors} from "../../common-style/Palette";
import {REGULAR, SEMI_BOLD} from "../../common-style/FontFamily";

export const styles = StyleSheet.create({
	genericInformationBlock: {
		backgroundColor: colors.GREY_SCALE_O,
		padding: 16,
		gap: 16,
	},
	blockHeader: {
		flexDirection: 'row'
	},
	blockTitle: {
		flex: 1,
		fontFamily: SEMI_BOLD,
		fontWeight: '600',
		fontSize: 18,
		lineHeight: 28,
	},
	blockSegment: {
		flexDirection: 'row',
	},
	segmentLabel: {
		fontFamily: SEMI_BOLD,
		fontWeight: '600',
		fontSize: 16,
		lineHeight: 24,
	},
	segmentSpan: {
		fontFamily: REGULAR,
		fontWeight: '400',
	},
	warningSign: {
		marginLeft: 8
	}
});
