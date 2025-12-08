import { StyleSheet } from 'react-native';
import { colors } from '../../common-style/Palette';
import { BASE_UNIT } from '../../common-style/Helpers';

export default StyleSheet.create({
	transactionItemContainer: {
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'flex-start',
		padding: 12,
		gap: BASE_UNIT / 2
	},
	iconColumn: {
		flexDirection: 'column',
		alignItems: 'center',
		gap: BASE_UNIT / 2
	},
	icon: {
		width: 52,
		height: 48
	},
	transactionDate: {
		fontSize: 12,
		color: colors.GREY_SCALE
	},
	transactionDetails: {
		flex: 1,
		gap: 4
	},
	transactionTitle: {
		fontSize: BASE_UNIT,
		fontWeight: 'bold'
	},
	transactionSupplier: {
		fontSize: 14,
		color: colors.GREY_SCALE_7
	},
	transactionAmountWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2
	},
	transactionAmount: {
		fontSize: BASE_UNIT,
		fontWeight: 'bold',
		color: colors.GREY_SCALE_7
	}
});
