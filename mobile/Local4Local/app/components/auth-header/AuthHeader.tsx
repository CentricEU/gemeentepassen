import {View} from "react-native";
import {Text} from "react-native-paper";
import {memo} from "react";
import styles from "./AuthHeaderStyle";
import { useTranslation } from "react-i18next";

function AuthHeader({title, description}: any) {
	const { t } = useTranslation('common');

	return (
		<View style={styles.titleContainer}>
			<Text variant="headlineMedium"
				  style={styles.mainTitle}>{t(title)}</Text>
			<Text variant="titleMedium" style={styles.descriptionTitle}>{t(description)}</Text>
		</View>
	);
}

export default memo(AuthHeader);
