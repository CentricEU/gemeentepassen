import { StyleSheet } from "react-native";
import { colors } from '../../common-style/Palette';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: colors.BACKDROP,
    },
    closeIcon: {
        alignSelf: 'flex-end',
    },
    drawer: {
        backgroundColor: colors.GREY_SCALE_O,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    titleContainer: {
        alignSelf: 'center',
        fontSize: 18,
        lineHeight: 28,
        fontWeight: "600"
    },
    dialogContent: {
        alignSelf: 'flex-start',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "600"
    },
    drawerContent: {
        paddingVertical: 4,
        paddingHorizontal: 20,
        gap: 20
    },
});

export default styles;
