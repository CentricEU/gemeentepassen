import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
	accordContainer: {
		paddingBottom: 4
	},
	accordHeader: {
		flex: 1,
		flexDirection: 'row',
		gap: 8,
		justifyContent: 'flex-start'
	},
	accordTitle: {
		fontSize: 20,
	},
	accordBody: {
		padding: 12
	}
});

export default styles;
