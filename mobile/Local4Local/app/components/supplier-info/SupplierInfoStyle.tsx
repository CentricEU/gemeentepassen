import { StyleSheet } from "react-native";
import { REGULAR, SEMI_BOLD } from "../../common-style/FontFamily";
import { colors } from "../../common-style/Palette";

export const styles = StyleSheet.create({
	supplierDetails: {
		paddingHorizontal: 16,
		gap: 16,
		flexDirection: 'row',
		alignItems: 'center'
	},
	supplierInformation: {
		gap: 4,
		flex: 1,
		paddingHorizontal: 16,
	},
	supplierRow: {
		flexDirection: 'row',
		gap: 4,
	},
	supplierCategory: {
		fontFamily: SEMI_BOLD,
		fontWeight: '600',
		fontSize: 14,
	},
	holidayWarning: {
		color: colors.L4L_MOBILE_WARNING,
		fontSize: 14,
		paddingHorizontal: 16
	},
	supplierName: {
		fontFamily: SEMI_BOLD,
		fontWeight: '600',
		fontSize: 20,
	},
	supplierInformationText: {
		fontFamily: REGULAR,
		fontWeight: '400',
		fontSize: 14,
	},
	open: {
		color: colors.SUCCESS
	},
	daySchedule: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8
	},
	dayHours: {
		width: '50%'
	}
});
