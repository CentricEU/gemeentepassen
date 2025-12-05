import { Icon, Text } from 'react-native-paper';
import styles from "./ButtonWithArrowStyle";
import { useTranslation } from 'react-i18next';
import ArrowRightRegularIcon from '../../assets/icons/chevron-large-right_r.svg'
import { TouchableOpacity, View } from 'react-native';
import { colors } from '../../common-style/Palette';

export default function ButtonWithArrow({ onPressHandler, text, icon, customSvg }: any) {

	const { t } = useTranslation('common');

	return (
		<TouchableOpacity style={styles.buttonContainer} onPress={onPressHandler}>
			<View style={styles.buttonContent}>
				{icon && <Icon
					source={icon}
					size={24}
					color={colors.GREY_SCALE}
				/>}

				{customSvg}
				<Text style={styles.buttonText}>{t(text)}</Text>
			</View>
			<ArrowRightRegularIcon height={24} />
		</TouchableOpacity>
	);
}
