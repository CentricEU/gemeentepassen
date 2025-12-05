import { StyleSheet } from "react-native";
import { colors } from "../../common-style/Palette";

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        height: 'auto',
        padding: 20
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: colors.BLACK
    },
    closeButton: {
        fontWeight: 'bold',
        color: colors.GREY_SCALE_500
    },
    iconContainer: {
        position: 'absolute',
        top: 2,
        right: 2
    },
    icon: {
        marginRight: 10,
        color: colors.STATUS_DANGER_500
    },
    content: {
        flexDirection: 'row',
        gap: 8,
        maxWidth: 270
    }
});

export default styles;