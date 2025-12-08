import { FlatList, RefreshControl, Text, View } from 'react-native';
import OfferCard from '../offer-card/OfferCard';
import styles from './OffersListStyle';
import { Divider } from 'react-native-paper';
import OfferTypeSelector from '../offer-type-selector/OfferTypeSelector';
import common from '../../common-style/CommonStyle';
import { useCallback, useEffect, useState } from 'react';
import offerChipsData from '../../utils/constants/offerChipsData';
import { useTranslation } from 'react-i18next';
import { OfferMobileListDto } from '../../utils/types/offerMobileListDto';
import OfferService from '../../services/OfferService';
import { useFocusEffect } from '@react-navigation/native';
import { useRefresh } from '../../contexts/pull-to-refresh/refresh-provider';
import SearchNoResults from '../search-no-results/SearchNoResults';
import { colors } from '../../common-style/Palette';
import { MINIMUM_SEARCH_KEYWORD_LENGTH } from '../../utils/constants/constants';

export default function OffersList({
	navigation,
	currentLocation,
	selectedType,
	setSelectedType,
	searchKeyword,
	onResetToInitialState,
	setNoOffersInList
}: any) {
	const { t } = useTranslation('common');
	const { refreshing, startRefresh, stopRefresh } = useRefresh();

	const [currentPage, setCurrentPage] = useState(0);
	const [data, setData] = useState<OfferMobileListDto[]>([]);
	const [loadingOffers, setLoadingOffers] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);

	const validateKeyword = (page: number) => {
		const isValidKeyword = searchKeyword && searchKeyword.length >= MINIMUM_SEARCH_KEYWORD_LENGTH;

		if (isValidKeyword && page === 0) {
			setData([]);
		}

		return isValidKeyword;
	};

	const shouldSetNoOffers = (offersLength: number, page: number) => {
		const isInitialLoad = page === 0 && data.length === 0;
		const isFirstPage = page === 0;

		return offersLength === 0 && (isInitialLoad || isFirstPage);
	};

	const getOffers = async (page: number) => {
		setLoadingOffers(true);
		const isValidKeyword = validateKeyword(page);

		try {
			const offers = await OfferService.getOffers(
				page,
				currentLocation.latitude,
				currentLocation.longitude,
				selectedType,
				isValidKeyword ? searchKeyword : null
			);

			if (shouldSetNoOffers(offers.length, page)) {
				setNoOffersInList(true);
				return;
			}

			setNoOffersInList(false);
			setData((prevData) => (page === 0 ? offers : [...prevData, ...offers]));
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingOffers(false);
			stopRefresh();
		}
	};

	useEffect(() => {
		setCurrentPage(0);
		setData([]);
		getOffers(0);
	}, [selectedType]);


	useEffect(() => {
		setCurrentPage(0);
	}, [searchKeyword]);


	useFocusEffect(
		useCallback(() => {
			if (currentPage === 0) {
				getOffers(0);
			}
		}, [searchKeyword, currentPage, selectedType])
	);

	const handleRefresh = () => {
		setHasScrolled(false);
		startRefresh();
		setCurrentPage(0);
		setData([]);
		getOffers(0);
	};

	const handleLoadMore = () => {
		if (!loadingOffers && data.length > 0 && hasScrolled) {
			setCurrentPage((prevPage) => prevPage + 1);
			getOffers(currentPage + 1);
		}
	};

	const offersListHeader = () => {
		return (
			<View testID="offers-list">
				<View style={styles.offerTypesHeader}>
					<Text style={styles.offersListTitle}>
						{t('offersPage.offerTypes')} ({offerChipsData.length - 1})
					</Text>
				</View>
				<OfferTypeSelector selectedType={selectedType} setSelectedType={setSelectedType} />
				<Divider style={common.divider} />
				<Text style={[styles.offersListTitle, { marginHorizontal: 16, marginBottom: 8 }]}>
					{t('offersPage.title')}
				</Text>
			</View>
		);
	};

	if (loadingOffers && data.length === 0) {
		return <View style={{ flex: 1, backgroundColor: colors.SURFACE_50 }} />;
	}


	if (data.length === 0 && !loadingOffers && currentPage === 0) {
		const isSearch = searchKeyword && searchKeyword.length >= MINIMUM_SEARCH_KEYWORD_LENGTH;

		return (
			<View style={styles.offersListContainer}>
				<View style={{ marginTop: 16 }}>
					{offersListHeader()}
				</View>
				<SearchNoResults
					onResetToInitialState={onResetToInitialState}
					titleKey={isSearch ? 'offersPage.noResultsFound' : 'offersPage.noOffersYetTitle'}
					descriptionKey={isSearch ? 'offersPage.noResultsDescription' : 'offersPage.noOffersYetDescription'}
					hideButton={true}
				/>
			</View>
		);
	}

	return (
		<View style={styles.offersListContainer}>
			<FlatList
				data={data}
				renderItem={({ item }) => (
					<OfferCard offer={item} customStyle={styles.offersListCard} navigation={navigation} />
				)}
				ListHeaderComponent={offersListHeader()}
				style={styles.offersList}
				contentContainerStyle={styles.offersListContent}
				onEndReachedThreshold={0.3}
				onEndReached={handleLoadMore}
				keyExtractor={(item, index) => index.toString()}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				onScrollBeginDrag={() => {
					setHasScrolled(true);
				}}
				testID={'offers-flat-list'}
			/>
		</View>
	);
}
