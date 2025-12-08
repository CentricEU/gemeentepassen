import {  StyleSheet  } from 'react-native';
import {  REGULAR, SEMI_BOLD  } from '../../common-style/FontFamily';
import {  colors  } from '../../common-style/Palette';

const styles = StyleSheet.create({
	detailsContainer: {
		flexWrap: 'wrap',
		flexDirection: 'row',
		marginTop: 16,
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},
	detailsContainerForMap: {
		flexDirection: 'column',
		gap: 8,
		alignItems: 'flex-start',
	},
	locationTitle: {
		fontFamily: SEMI_BOLD,
		fontSize: 16,
		lineHeight: 24,
		color: colors.GREY_SCALE_7,
	},
	locationTitleListView: {
		flexShrink: 1,
		width: 'auto',
	},
	locationDetails: {
		flexDirection: 'row',
		marginVertical: 2,
		gap: 4,
		alignItems: 'center',
	},
	locationStatus: {
		fontFamily: REGULAR,
		fontSize: 14,
		lineHeight: 20,
		color: colors.GREY_SCALE,
	},
});

export default styles;
