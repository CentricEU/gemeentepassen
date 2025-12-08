import { StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../common-style/Palette";
import { REGULAR, SEMI_BOLD } from "../../common-style/FontFamily";

const commonFlexRow: ViewStyle = {
	flexDirection: "row",
	gap: 8,
};

const styles = StyleSheet.create({
	offerCard: {
		backgroundColor: colors.GREY_SCALE_O,
		paddingHorizontal: 16,
		paddingVertical: 8,
		shadowColor: colors.DARK_BLUE,
		shadowOffset: {
			width: 1,
			height: 2,
		},
		shadowOpacity: 0.12,
		shadowRadius: 3,
		elevation: 2,
	},
	inactiveOffertext: {
		color: colors.STATUS_DANGER_500,
		fontWeight: "bold",
	},
	offerInactive: {
		...commonFlexRow,
		alignItems: "center",
		marginBottom: 12,
	},
	chipsContainer: {
		...commonFlexRow,
	},
	offerTitle: {
		fontFamily: SEMI_BOLD,
		color: colors.GREY_SCALE_7,
		fontSize: 18,
		lineHeight: 28,
		marginVertical: 4,
	},
	offerCardBody: {
		flexDirection: "row",
	},
	offerCardBodyText: {
		justifyContent: "center",
		flex: 1,
	},
	arrowContainer: {
		justifyContent: "center",
		alignItems: "center",
		marginTop: 12,
	},
	offerDescription: {
		fontFamily: REGULAR,
		color: colors.GREY_SCALE_7,
		fontSize: 14,
		lineHeight: 20,
	},
	footerContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 8,
	},
	detailsButton: {
		margin: 4,
		marginLeft: "auto",
	},
});

export default styles;
