import { StyleSheet } from 'react-native';
import { colors } from '../../common-style/Palette';
import { BASE_UNIT } from '../../common-style/Helpers';

export default StyleSheet.create({
	container: {
		paddingTop: BASE_UNIT
	},
	noTransactiomnContainer: {
		backgroundColor: 'white',
		paddingVertical: BASE_UNIT / 2,
		paddingHorizontal: BASE_UNIT
	},
	monthContainer: {
		marginBottom: 16,
		paddingTop: BASE_UNIT
	},
	monthHeader: {
		fontSize: BASE_UNIT,
		fontWeight: 'bold',
		marginBottom: BASE_UNIT,
		marginLeft: BASE_UNIT
	},
	noTransactionsText: {
		fontSize: 14,
		color: colors.GREY_SCALE,
		paddingVertical: BASE_UNIT / 2
	}
});
