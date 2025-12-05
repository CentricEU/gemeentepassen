import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		padding: 20,
		height: '100%',
		flexDirection: 'column',
	},
	bottomToaster: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		left: 0,
		paddingLeft: 16,
		paddingRight: 16
	}
})
export default styles;