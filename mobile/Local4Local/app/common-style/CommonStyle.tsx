import { StyleSheet } from "react-native";
import { colors } from "./Palette";

const common = StyleSheet.create({
    divider: {
        backgroundColor: colors.SURFACE_300,
        margin: 16
    },
    flexDivider: {
        backgroundColor: colors.SURFACE_300,
        width: '100%',
        marginVertical: 8
    },
    clearDefaults: {
        marginHorizontal: 0,
        marginVertical: 0,
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    cardAppearance: {
        shadowColor: colors.DARK_BLUE,
        shadowOffset: {
            width: 1,
            height: 2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
        borderRadius: 4
    }
});

export default common;
