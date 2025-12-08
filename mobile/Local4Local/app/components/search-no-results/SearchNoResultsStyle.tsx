import { StyleSheet } from 'react-native';
import { colors } from '../../common-style/Palette';

const styles = StyleSheet.create({
	searchNoResultsContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		paddingHorizontal: 16,
		backgroundColor: colors.SURFACE_50,
		width: '100%',
		height: '100%',
		gap: 16,
		paddingBottom: '30%'
	},
	noResultsTile: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	noResultsDescription: {
		fontSize: 16,
		textAlign: 'center',
		width: '100%',
	},
	button: {
		width: 'auto',
		height: 'auto',
	}
});
export default styles;
