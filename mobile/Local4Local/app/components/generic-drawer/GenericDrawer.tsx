import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import styles from "./GenericDrawerStyle";
import CloseIcon from '../../assets/icons/close.svg'
import { useTranslation } from "react-i18next";

interface GenericDrawerProps {
    visible: boolean;
    description: string;
    title: string;
    onClose: () => void;
    buttons: React.ReactElement[]
}

const GenericDrawer: React.FC<GenericDrawerProps> = ({
    visible,
    description,
    title,
    onClose,
    buttons }) => {
    const { t } = useTranslation("common");

    const [dialogVisible, setDialogVisible] = useState(visible);

    const closeDrawer = () => onClose();


    useEffect(() => {
        setDialogVisible(visible);
    }, [visible]);


    if (!dialogVisible) {
        return null;
    }

    return (
        <View style={styles.overlay}>
            <View style={styles.drawer}>
                <IconButton testID='closeButton' style={styles.closeIcon}
                    icon={() => (
                        <CloseIcon width={24} height={24} />
                    )} size={24} onPress={closeDrawer} />

                <View style={styles.drawerContent}>
                    <Text style={styles.titleContainer}>{t(title)}</Text>
                    <Text style={styles.dialogContent}>{t(description)}</Text>
                    <View>
                        {buttons}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default GenericDrawer;
