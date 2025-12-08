import React, { useState } from 'react';
import { View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';
import EmailIcon from '../../assets/icons/email.svg';
import TimerButton from '../timer-button/TimerButton';
import styles from './GenericDialogStyle';
import GenericButton from '../generic-button/GenericButton';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';

interface GenericDialogProps {
	visible: boolean;
	description: React.ReactNode;
	title: string;
	dialogTitle: string;
	buttonText?: string;
	secondaryButtonText?: string;
	shouldDisplayTimer: boolean;
	onMainButtonPress?: () => void;
	onSecondaryButtonPress?: () => void;
}

const GenericDialog: React.FC<GenericDialogProps> = ({
	visible,
	description,
	dialogTitle,
	title,
	buttonText,
	secondaryButtonText,
	shouldDisplayTimer,
	onMainButtonPress,
	onSecondaryButtonPress
}) => {
	const [dialogVisible] = useState(visible);

	const actionButton = shouldDisplayTimer ? (
		<TimerButton buttonText={buttonText} onButtonPress={onMainButtonPress} />
	) : (
		buttonText && (
			<GenericButton
				type={ButtonTypeEnum.primary}
				text={buttonText || ''}
				onPressHandler={onMainButtonPress || (() => {})}
			/>
		)
	);

	const secondaryActionButton = (
		<GenericButton
			type={ButtonTypeEnum.secondary}
			text={secondaryButtonText || ''}
			onPressHandler={onSecondaryButtonPress || (() => {})}
		/>
	);

	return (
		<Portal>
			<Dialog visible={dialogVisible} dismissable={false}>
				<View style={styles.titleContainer}>
					<Dialog.Title style={styles.dialogTitle}>{dialogTitle}</Dialog.Title>
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
				<Dialog.Actions style={secondaryButtonText ? styles.doubleActionStyle : styles.actions}>
					{actionButton}
					{secondaryButtonText && secondaryActionButton}
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
};

export default GenericDialog;
