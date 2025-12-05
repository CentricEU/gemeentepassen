import {Dimensions, StyleSheet} from "react-native"
import {BOLD, REGULAR} from "../../common-style/FontFamily";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 12,
		justifyContent: 'center',
		gap: 96,
		minHeight: Dimensions.get('window').height
	},
	welcomeContainer: {
		width: '100%',
		alignItems: 'center',
		gap: 56,
	},
	welcomeText: {
		alignItems: 'center',
		gap: 16
	},
	welcomeTitle: {
		fontSize: 24,
		fontFamily: BOLD,
		fontWeight: "700",
		textAlign: 'center'
	},
	welcomeDescription: {
		fontSize: 18,
		fontFamily: REGULAR,
		fontWeight: "600",
		textAlign: "center"
	},
	buttonContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
})
export default styles;
