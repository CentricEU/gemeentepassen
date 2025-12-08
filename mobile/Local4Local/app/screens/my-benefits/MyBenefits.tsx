import Stack from '../../navigations/StackNavigator';
import { headerOptions } from '../../components/header/GlobalHeader';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import style from '../../assets/styles/ListViewCardsStyle';
import EmptyState from '../../assets/icons/no-data.svg';
import { BenefitLightDto } from '../../utils/types/benefitLightDto';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import BenefitService from '../../services/BenefitService/BenefitService';
import BenefitCard from '../../components/benefit-card/BenefitCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const getAllBenefits = async (
	setActiveBenefits: React.Dispatch<React.SetStateAction<BenefitLightDto[]>>,
	setExpiredBenefits: React.Dispatch<React.SetStateAction<BenefitLightDto[]>>
) => {
	try {
		const { active, expired } = await BenefitService.getAllBenefits();
		setActiveBenefits(Array.isArray(active) ? active : []);
		setExpiredBenefits(Array.isArray(expired) ? expired : []);
	} catch (error) {
		console.error('Failed to fetch benefits:', error);
	}
};

export function MyBenefits() {
	const { t } = useTranslation('common');

	const [activeBenefits, setActiveBenefits] = useState<BenefitLightDto[]>([]);
	const [expiredBenefits, setExpiredBenefits] = useState<BenefitLightDto[]>([]);

	useFocusEffect(
		useCallback(() => {
			getAllBenefits(setActiveBenefits, setExpiredBenefits);
		}, [])
	);

	const isEmptyStateContainer = !activeBenefits?.length && !expiredBenefits?.length;

	const renderEmptyState = () => (
		<View style={style.emptyStateContainer}>
			<EmptyState />
			<View style={style.emptyStateDescriptionContainer}>
				<Text style={style.emptyStateTitle} testID="no-benefits-title">
					{t('benefits.noBenefitsTitle')}
				</Text>
				<Text style={style.emptyStateDescription} testID="no-benefits-description">
					{t('benefits.noBenefitsDescription')}
				</Text>
			</View>
		</View>
	);

	const renderBenefitList = (benefits: BenefitLightDto[], title: string, emptyStateTitle: string) => (
		<>
			<Text style={style.status}>{benefits.length > 0 ? title : emptyStateTitle}</Text>
			{benefits.map((benefit) => (
				<Pressable key={benefit.name} style={style.cardContainer}>
					<BenefitCard benefit={benefit}/>
				</Pressable>
			))}
		</>
	);

	return isEmptyStateContainer ? (
		renderEmptyState()
	) : (
		<SafeAreaView style={style.cardsContainer} edges={['bottom', 'left', 'right']}>
			<ScrollView style={style.scrollContainer} contentContainerStyle={{ width: '100%' }}>
				<View style={style.cardsPage}>
					{renderBenefitList(
						activeBenefits,
						t('generic.status.active'),
						t('benefits.noActiveBenefits')
					)}
					<View style={{ marginTop: 32 }}>
						{renderBenefitList(
							expiredBenefits,
							t('generic.status.expired'),
							t('benefits.noExpiredBenefits')
						)}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

export function BenefitsStack({}: { navigation: any }) {
	const { t } = useTranslation('common');

	return (
		<Stack.Navigator
			screenOptions={{
				...headerOptions
			}}>
			<Stack.Screen
				name="Benefits"
				component={MyBenefits}
				options={{
					title: t('navigation.benefits')
				}}
			/>
		</Stack.Navigator>
	);
}
