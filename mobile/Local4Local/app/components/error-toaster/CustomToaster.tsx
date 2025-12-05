import { View, Text } from "react-native";
import styles from "./CustomToasterStyle";
import React from "react";
import { IconButton } from "react-native-paper";
import { colors } from "../../common-style/Palette";
import { ToasterTypeEnum } from "../../utils/enums/toasterTypeEnum";

interface ErrorLabelProps {
    message: string;
    onClose: () => void;
    toasterType: ToasterTypeEnum;
}

interface IconProps {
    icon: any;
    fill: string;
}

const iconMapping: Record<string, any> = {
    error: require("../../assets/icons/exclamation-triangle_b.svg").default,
    info: require("../../assets/icons/info-circle_b.svg").default,
    success: require("../../assets/icons/check-circle_b.svg").default,
    warning: require("../../assets/icons/exclamation-circle_b.svg").default,
};

const CustomToaster: React.FC<ErrorLabelProps> = ({ message, onClose, toasterType }) => {
    const { backgroundColor, borderColor } = {
        backgroundColor: {
            info: colors.STATUS_INFO_100,
            success: colors.SUCCESS_100,
            warning: colors.STATUS_WARNING_100,
            error: colors.STATUS_DANGER_100,
        }[toasterType],
        borderColor: {
            info: colors.STATUS_INFO_500,
            success: colors.SUCCESS,
            warning: colors.STATUS_WARNING_900,
            error: colors.STATUS_DANGER_500,
        }[toasterType],
    };

    const IconComponent = iconMapping[toasterType];

    return (
        <View testID="custom-toaster" style={[styles.container, { backgroundColor, borderColor, marginBottom: 16}]}>
            <View style={styles.content}>
                {IconComponent && <SVGIcon icon={IconComponent} fill={borderColor} />}
                <Text style={styles.errorText}>{message}</Text>
            </View>
            <View style={styles.iconContainer}>
                <IconButton icon="close" size={24} onPress={onClose} />
            </View>
        </View>
    );
};

const SVGIcon: React.FC<IconProps> = ({ icon: IconComponent, fill }) => {
    return IconComponent ? <IconComponent testID="svg-icon" fill={fill} width={24} height={24} /> : null;
};

export default CustomToaster;
