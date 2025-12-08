import { StyleSheet } from 'react-native';
import commonAuthStyle from '../../common-style/CommonAuthStyle';

const styles = StyleSheet.create({
	...commonAuthStyle,
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
		width: '90%'
	},
	checkboxItem: {
		width: 40,
		height: 32,
		marginLeft: -24,
		marginRight: 16
	},
	termsAndConditionsLayout: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'white',
		zIndex: 9999,
		padding: 16
	}
});

export default styles;
