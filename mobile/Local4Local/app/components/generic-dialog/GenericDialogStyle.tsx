import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../../common-style/Palette';

interface CommonStyles {
    textCenter: TextStyle,
    textBold: TextStyle,
    colorGrey: TextStyle,
    containerCenter: ViewStyle,
    backgroundGrey: ViewStyle,
    backgroundSurface: ViewStyle
}

const generateTextStyles = (lineHeight: number, fontSize: number): TextStyle => ({
    lineHeight,
    fontSize
});

const commonStyles: CommonStyles = {
    textCenter: {
        textAlign: 'center',
    },
    textBold: {
        fontWeight: '700',
    },
    colorGrey: {
        color: colors.GREY_SCALE_7,
    },
    containerCenter: {
        alignItems: 'center',
    },
    backgroundGrey: {
        backgroundColor: colors.GREY_SCALE_O
    },
    backgroundSurface: {
        backgroundColor: colors.SURFACE_50
    }
};

const styles = StyleSheet.create({
    dialogTitle: {
        ...generateTextStyles(24, 16),
        ...commonStyles.textBold,
        ...commonStyles.textCenter,
        ...commonStyles.colorGrey,
        fontSize: 16
    },
    dialogContent: {
        ...commonStyles.backgroundGrey,
        ...commonStyles.containerCenter
    },
    textContainer: {
        ...commonStyles.containerCenter
    },
    title: {
        ...generateTextStyles(36, 24),
        ...commonStyles.textBold,
        ...commonStyles.colorGrey,
        fontSize: 24
    },
    description: {
        ...commonStyles.textCenter,
        ...generateTextStyles(24, 16),
        fontSize: 16
    },
    actions: {
        ...commonStyles.backgroundSurface,
        paddingTop: 16,
        paddingBottom: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopWidth: 1,
        borderTopColor: colors.SURFACE_300
    },
    spacing: {
        marginTop: 16
    },
    titleContainer: {
        ...commonStyles.backgroundSurface,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        marginTop: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.SURFACE_300
    }
});

export default styles;
