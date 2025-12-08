import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { headerOptions } from '../../components/header/GlobalHeader';
import DiscountCodeService from '../../services/DiscountCodeService';
import { DiscountCodeDto } from '../../utils/types/discountCode';
import EmptyState from '../../assets/icons/no-data.svg';
import GenericButton from '../../components/generic-button/GenericButton';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import style from '../../assets/styles/ListViewCardsStyle';
import DiscountCodeCard from '../../components/discount-code-card/DiscountCodeCard';
//import SearchBar from '../../components/search-bar/SearchBar';
import { NavigationEnum } from '../../utils/enums/navigationEnum';
import { Offers } from '../offers/OfferScreen';
import { DiscountCode, DiscountsStackParamList } from '../discount-code/DiscountCode';
import { createStackNavigator } from '@react-navigation/stack';

const getAllDiscountCodes = async (
	setActiveDiscountCodes: React.Dispatch<React.SetStateAction<DiscountCodeDto[]>>,
	setInactiveDiscountCodes: React.Dispatch<React.SetStateAction<DiscountCodeDto[]>>
) => {
	try {
		const { active, inactive } = await DiscountCodeService.getAllDiscountCodes();
		setActiveDiscountCodes(active);
		setInactiveDiscountCodes(inactive);
	} catch (error) {
		console.error('Failed to fetch discount codes:', error);
	}
};

export function Discounts({ navigation }: { navigation: any }) {
	const { t } = useTranslation('common');

	const [activeDiscountCodes, setActiveDiscountCodes] = useState<DiscountCodeDto[]>([]);
	const [inactiveDiscountCodes, setInactiveDiscountCodes] = useState<DiscountCodeDto[]>([]);
	//const [searchQuery, setSearchQuery] = useState<string>('');

	useFocusEffect(
		useCallback(() => {
			getAllDiscountCodes(setActiveDiscountCodes, setInactiveDiscountCodes);
		}, [])
	);

	const renderEmptyState = () => (
		<View style={style.emptyStateContainer}>
			<EmptyState />
			<View style={style.emptyStateDescriptionContainer}>
				<Text style={style.emptyStateTitle} testID="no-discounts-title">
					{t('discounts.noDiscountsTitle')}
				</Text>
				<Text style={style.emptyStateDescription} testID="no-discounts-description">
					{t('discounts.noDiscountsDescription')}
				</Text>
			</View>
			<View style={style.buttonContainer}>
				<GenericButton
					type={ButtonTypeEnum.primary}
					text={t('generic.buttons.exploreOffers')}
					onPressHandler={() => navigation.navigate('OffersStack')}
				/>
			</View>
		</View>
	);

	const renderDiscountList = (discountCodes: DiscountCodeDto[], title: string, emptyStateTitle: string) => (
		<>
			<Text style={style.status}>{discountCodes.length > 0 ? title : emptyStateTitle}</Text>
			{discountCodes.map((discountCode) => (
				<Pressable
					key={discountCode.code}
					style={style.cardContainer}
					onPress={() => {
						if (discountCode.isActive) {
							navigation.navigate(NavigationEnum.discountCode, {
								discountCode: discountCode,
								offerTitle: discountCode.offerTitle
							});
						}
					}}>
					<DiscountCodeCard discountCode={discountCode} isDiscountsListView={true} />
				</Pressable>
			))}
		</>
	);

	const isEmptyStateContainer = !activeDiscountCodes.length && !inactiveDiscountCodes.length;

	return isEmptyStateContainer ? (
		renderEmptyState()
	) : (
		<SafeAreaView style={style.cardsContainer}>
			{/* <SearchBar
               value={searchQuery}
               changeTextHandler={setSearchQuery}
               placeholder={'search.searchBarTextDiscounts'}
               hideFilterButton={true}
               disableFocus={true}
             /> */}
			<ScrollView style={style.scrollContainer}>
				<View style={style.cardsPage}>
					{renderDiscountList(
						activeDiscountCodes,
						t('generic.status.active'),
						t('discounts.noActiveDiscounts')
					)}
					<View style={{ marginTop: 32 }}>
						{renderDiscountList(
							inactiveDiscountCodes,
							t('generic.status.expired'),
							t('discounts.noExpiredDiscounts')
						)}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const Stack = createStackNavigator<DiscountsStackParamList>();

export function DiscountsStack() {
	const { t } = useTranslation('common');

	return (
		<Stack.Navigator
			screenOptions={{
				...headerOptions,
				headerStyle: {
					shadowColor: 'transparent'
				}
			}}>
			<Stack.Screen
				name="Discounts"
				component={Discounts}
				options={{
					title: t('navigation.discounts')
				}}
			/>
			<Stack.Screen
				name="DiscountCode"
				component={DiscountCode}
				options={{
					title: t('navigation.discountCode')
				}}
			/>
			<Stack.Screen
				name="Home"
				component={Offers}
				options={{
					title: t('navigation.home')
				}}
			/>
		</Stack.Navigator>
	);
}
