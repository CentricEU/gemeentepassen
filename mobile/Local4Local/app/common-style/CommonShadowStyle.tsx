import { StyleSheet } from 'react-native';
import { colors } from '../common-style/Palette';

export const commonShadowStyles = StyleSheet.create({
    shadow: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        backgroundColor: colors.GREY_SCALE_O
    },
});
