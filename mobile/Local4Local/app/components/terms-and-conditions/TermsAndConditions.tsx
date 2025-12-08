import React from 'react';
import { ScrollView, View, Text, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import GenericButton from '../generic-button/GenericButton';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { colors } from '../../common-style/Palette';
import styles from './TermsAndConditionsStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

type TermsAndConditionsProps = {
	setTermsAndConditionView: (visible: boolean) => void;
};

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ setTermsAndConditionView }) => {
	const { t } = useTranslation('common');

	return (
		<SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'top']}>
			<ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 24 }}>
				<View style={{ marginBottom: 16 }}>
					<Text style={{ marginBottom: 8 }}>{t('privacy.intro.paragraph_1')}</Text>
					<Text style={{ marginBottom: 8 }}>{t('privacy.intro.paragraph_2')}</Text>
					<Text style={{ marginBottom: 8, fontWeight: 'bold' }}>{t('privacy.intro.paragraph_3')}</Text>
					<View style={{ marginBottom: 12 }}>
						{[1, 2, 3, 4].map((i) => (
							<Text key={`intro-item-${i}`} style={{ marginLeft: 16, marginBottom: 4 }}>
								• {t(`privacy.intro.item_${i}`)}
							</Text>
						))}
					</View>

					<Text style={styles.sectionTitle}>{t('privacy.promises.title')}</Text>
					<Text style={{ marginBottom: 8 }}>{t('privacy.promises.subtitle')}</Text>
					<View style={{ marginBottom: 12 }}>
						{[
							{ key: 'purpose' },
							{ key: 'basis' },
							{ key: 'minimization' },
							{ key: 'transparency' },
							{ key: 'safety' }
						].map((p) => (
							<Text key={`promise-${p.key}`} style={{ marginLeft: 16, marginBottom: 4 }}>
								<Text style={{ fontWeight: 'bold' }}>{t(`privacy.promises.${p.key}.title`)} </Text>
								{t(`privacy.promises.${p.key}.description`)}
							</Text>
						))}
					</View>

					<Text style={styles.sectionTitle}>{t('privacy.security.title')}</Text>
					<Text style={{ marginBottom: 12 }}>{t('privacy.security.description')}</Text>

					<Text style={styles.sectionTitle}>{t('privacy.breach.title')}</Text>
					<Text style={{ marginBottom: 8 }}>{t('privacy.breach.paragraph_1')}</Text>
					<Text style={{ marginBottom: 12 }}>{t('privacy.breach.paragraph_2')}</Text>

					<Text style={styles.sectionTitle}>{t('privacy.rights.title')}</Text>
					<Text style={{ marginBottom: 8 }}>{t('privacy.rights.subtitle')}</Text>
					<View style={{ marginBottom: 12 }}>
						{[
							'access',
							'correction',
							'forgotten',
							'portability',
							'restriction',
							'automated',
							'objection'
						].map((r) => (
							<Text key={`right-${r}`} style={{ marginLeft: 16, marginBottom: 4 }}>
								<Text style={{ fontWeight: 'bold' }}>{t(`privacy.rights.${r}.title`)} </Text>
								{t(`privacy.rights.${r}.description`)}
							</Text>
						))}
					</View>

					<Text style={styles.sectionTitle}>{t('privacy.contact.title')}</Text>
					<Text style={{ marginBottom: 8 }}>{t('privacy.contact.description')}</Text>
					<Text style={{ marginBottom: 12 }}>
						{t('privacy.contact.cta')}{' '}
						<Text
							style={{ color: colors.THEME_500 }}
							onPress={() => {
								const email = 'info@gemeentepassen.eu';
								const subject = '';
								const body = '';
								const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
									subject
								)}&body=${encodeURIComponent(body)}`;
								Linking.openURL(mailtoUrl);
							}}>
							info@gemeentepassen.eu
						</Text>
					</Text>

					<Text style={styles.sectionTitle}>{t('privacy.complaint.title')}</Text>
					<Text style={{ marginBottom: 12 }}>{t('privacy.complaint.description')}</Text>

					<Text style={styles.sectionTitle}>{t('privacy.info_sheet.title')}</Text>
					<Text style={{ marginBottom: 8 }}>{t('privacy.info_sheet.subtitle')}</Text>
					<View style={{ marginBottom: 12 }}>
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Text key={`info-sheet-item-${i}`} style={{ marginLeft: 16, marginBottom: 4 }}>
								• {t(`privacy.info_sheet.item_${i}`)}
							</Text>
						))}
					</View>
				</View>
				<GenericButton
					type={ButtonTypeEnum.secondary}
					text={t('generic.buttons.close')}
					onPressHandler={() => setTermsAndConditionView(false)}
				/>
			</ScrollView>
		</SafeAreaView>
	);
};

export default TermsAndConditions;
