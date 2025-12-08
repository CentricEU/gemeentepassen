import { StyleSheet } from 'react-native';
import { BOLD } from '../../common-style/FontFamily';
import { colors } from '../../common-style/Palette';

const styles = StyleSheet.create({
	offersListContainer: {
		backgroundColor: colors.SURFACE_50,
		flex: 1
	},
	offersListTitle: {
		fontFamily: BOLD,
		color: colors.GREY_SCALE_7,
		flex: 1
	},
	offersList: {
		paddingTop: 16
	},
	offersListContent: {
		paddingBottom: 128
	},
	offersListCard: {
		marginHorizontal: 16,
		marginVertical: 8
	},
	offerTypesHeader: {
		flexDirection: 'row',
		marginHorizontal: 16,
		marginBottom: 16
	}
});

export default styles;
