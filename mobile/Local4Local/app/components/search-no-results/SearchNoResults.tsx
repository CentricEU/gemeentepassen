import { View, Text } from 'react-native';
import GenericButton from '../generic-button/GenericButton';
import styles from './SearchNoResultsStyle';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { useTranslation } from 'react-i18next';

type Props = {
	onResetToInitialState: () => void;
	titleKey: string;
	descriptionKey: string;
	hideButton?: boolean;
};

export default function SearchNoResults({
	onResetToInitialState,
	titleKey,
	descriptionKey,
	hideButton = false
}: Props): any {
	const { t } = useTranslation('common');

	return (
		<View style={styles.searchNoResultsContainer}>
			<Text style={styles.noResultsTile}>{t(titleKey)}</Text>
			<Text style={styles.noResultsDescription}>{t(descriptionKey)}</Text>

			{!hideButton && (
				<View style={styles.button}>
					<GenericButton
						type={ButtonTypeEnum.primary}
						text={t('offersPage.seeAllOffers')}
						onPressHandler={onResetToInitialState}></GenericButton>
				</View>
			)}
		</View>
	);
}
