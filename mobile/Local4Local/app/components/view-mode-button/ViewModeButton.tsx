import {Button} from 'react-native-paper';
import ListBulletRegularIcon from '../../assets/icons/list-bullet_r.svg';
import MapBoldIcon from '../../assets/icons/map_b.svg';
import styles from "./ViewModeButtonStyle";
import {Text} from "react-native";
import {colors} from "../../common-style/Palette";
import { useTranslation } from 'react-i18next';

export default function ViewModeButton({customStyle, mapMode, onPressHandler}: any) {

	const { t } = useTranslation('common');

	return (
		<Button
			testID="view-mode-button"
			mode={'contained'}
			buttonColor={colors.THEME_500}
			style={[styles.viewModeButton, customStyle]}
			labelStyle={styles.viewModeButtonLabel}
			icon={() => {
				return mapMode ? <ListBulletRegularIcon testID="list-icon" height={24} width={24} fill={colors.GREY_SCALE_O}/>
					: <MapBoldIcon testID="map-icon" height={24} width={24} fill={colors.GREY_SCALE_O}/>
			}}
			onPress={onPressHandler}
		>
			{mapMode ? <Text>{t('generic.buttons.viewList')}</Text> : <Text>{t('generic.buttons.viewMap')}</Text>}
		</Button>
	);
}

