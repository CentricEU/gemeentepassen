import React, { useState } from "react";
import { View } from "react-native";
import { Dialog, Portal, Text } from "react-native-paper";
import EmailIcon from "../../assets/icons/email.svg";
import TimerButton from "../timer-button/TimerButton";
import styles from "./GenericDialogStyle";

interface GenericDialogProps {
    visible: boolean;
    description: React.ReactNode;
    title: string;
    buttonText: string;
    onButtonPress: () => void;
}

const GenericDialog: React.FC<GenericDialogProps> = ({
    visible,
    description,
    title,
    buttonText,
    onButtonPress
}) => {
    const [dialogVisible] = useState(visible);

    return (
        <Portal>
            <Dialog visible={dialogVisible} dismissable={false}>
                <View style={styles.titleContainer}>
                    <Dialog.Title style={styles.dialogTitle}>{title}</Dialog.Title>
                </View>
                <Dialog.Content style={styles.dialogContent}>
                    <View style={{ marginTop: 32 }}>
                        <EmailIcon />
                    </View>
                    <View style={styles.spacing}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <View style={styles.spacing}>
                        <Text style={styles.description}>{description}</Text>
                    </View>
                </Dialog.Content>
                <Dialog.Actions style={styles.actions} >
                    <TimerButton buttonText={buttonText} onButtonPress={onButtonPress} />
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default GenericDialog;
