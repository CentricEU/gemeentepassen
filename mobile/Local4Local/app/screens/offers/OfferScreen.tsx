import { SafeAreaView, View } from 'react-native';
import Map from '../../components/map/Map';
import { headerOptions } from '../../components/header/GlobalHeader';
import SearchBar from '../../components/search-bar/SearchBar';
import ViewModeButton from '../../components/view-mode-button/ViewModeButton';
import OfferTypeSelector from '../../components/offer-type-selector/OfferTypeSelector';
import { useContext, useState, useEffect } from 'react';
import styles from './OffersStyle';
import OffersList from '../../components/offers-list/OffersList';
import OfferDetails from '../offer-details/OfferDetails';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import OfferDrawer from '../../components/offer-drawerd/OfferDrawer';
import { LocationContext } from '../../contexts/location/location-provider';
import OffersGroupDrawer from '../../components/offers-group-drawer/OffersGroupDrawer';
import { DiscountCode } from '../discount-code/DiscountCode';
import SearchDropdown from '../../components/search-dropdown/SearchDropdown';
import OfferService from '../../services/OfferService';
import OfferSearchHistoryService from '../../services/OfferSearchHistoryService';
import { colors } from '../../common-style/Palette';
import BackArrow from '../../assets/icons/back.svg';
import { IconButton } from 'react-native-paper';
import { MINIMUM_SEARCH_KEYWORD_LENGTH } from '../../utils/constants/constants';

export type OfferStackParamList = {
	Offers: undefined;
	OfferDetails: {
		offerTitle: string;
		offerId: string;
	};
	DiscountCode: {
		offerTitle: string;
		offerId: string;
	};
};

const Stack = createStackNavigator<OfferStackParamList>();

export function Offers({ navigation }: { navigation: any }) {
	const { location } = useContext(LocationContext);

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedType, setSelectedType] = useState(-1);
	const [isMapMode, setIsMapMode] = useState(true);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [searchResults, setSearchResults] = useState<string[]>([]);
	const [searchHistory, setSearchHistory] = useState<string[]>([]);
	const [finalSearchKeyword, setFinalSearchKeyword] = useState<string>('');
	const [isSearching, setIsSearching] = useState(false);
	const [searchBarKey, setSearchBarKey] = useState(0);
	const [noSearchResults, setNoSearchResults] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [noOffersInList, setNoOffersInList] = useState(false);
	const [showMinLengthWarning, setShowMinLengthWarning] = useState(false);

	useEffect(() => {
		navigation.setOptions({
			headerShown: !isSearchFocused,
			headerLeft: () =>
				hasSearched &&
				!isSearchFocused && (
					<IconButton
						icon={() => <BackArrow width={24} height={24} fill={colors.GREY_SCALE} />}
						onPress={() => {
							handleResetToInitialState();
						}}
					/>
				)
		});
	}, [navigation, hasSearched, isSearchFocused]);

	const fetchSearchHistory = async () => {
		try {
			const history = await OfferSearchHistoryService.getSearchHistoryForCitizen();
			setSearchHistory(history);
		} catch (error) {
			console.error(error);
			setSearchHistory([]);
		}
	};

	const handleSearch = async (query: string) => {
		setSearchQuery(query);

		if (query.length < MINIMUM_SEARCH_KEYWORD_LENGTH) {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		setIsSearching(true);
		try {
			const results = await OfferService.searchOffersByKeyword(query);
			setSearchResults(results);
			setNoSearchResults(results.length === 0);
		} catch (error) {
			console.error(error);
			setSearchResults([]);
			setNoSearchResults(true);
		}
	};

	const resetSearchBar = () => {
		setSearchBarKey((prevKey) => prevKey + 1);
	};

	const handleSelectResult = async (selectedText: string) => {
		setSearchQuery(selectedText);
		setSearchResults([]);
		setIsSearchFocused(false);
		setFinalSearchKeyword(selectedText);
		setIsMapMode(false);
		setHasSearched(true);
		setIsSearching(false);
		setShowMinLengthWarning(false);
		resetSearchBar();
	};

	const switchViewMode = () => {
		setIsMapMode(!isMapMode);
	};

	const handleResetToInitialState = () => {
		setSearchQuery('');
		setFinalSearchKeyword('');
		setIsMapMode(true);
		setNoSearchResults(false);
		setHasSearched(false);
		setNoOffersInList(false);
		resetSearchBar();
	};

	const displayMapView = () => {
		return (
			location && (
				<>
					<OfferTypeSelector
						customStyle={styles.mapOfferTypeSelector}
						selectedType={selectedType}
						setSelectedType={setSelectedType}
					/>
					<Map
						testID="map-view"
						currentLocation={location}
						offerType={selectedType}
						searchKeyword={finalSearchKeyword}
					/>

					<OfferDrawer navigation={navigation} />
					<OffersGroupDrawer navigation={navigation} />
				</>
			)
		);
	};

	const handleSubmit = () => {
		if (searchQuery.length < MINIMUM_SEARCH_KEYWORD_LENGTH) {
			setShowMinLengthWarning(true);
			return;
		}
		setShowMinLengthWarning(false);
		handleSelectResult(searchQuery);
		setIsSearching(false);
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container}>
				<SearchBar
					key={searchBarKey}
					value={searchQuery}
					changeTextHandler={handleSearch}
					placeholder={'search.searchBarTextOffer'}
					hideFilterButton={false}
					onSearchPress={handleSubmit}
					onFocus={() => {
						setIsSearchFocused(true);
						fetchSearchHistory();

						if (searchQuery.length >= MINIMUM_SEARCH_KEYWORD_LENGTH && searchResults.length === 0) {
							handleSearch(searchQuery);
						}
					}}
					onBlur={() => {
						setIsSearchFocused(false);
					}}
					showBackArrow={hasSearched}
					clearSearch={handleResetToInitialState}
					resetSearchBar={resetSearchBar}
					setShowMinLengthWarning={setShowMinLengthWarning}
				/>

				{isSearchFocused && (
					<SearchDropdown
						results={searchResults}
						history={searchQuery.length >= MINIMUM_SEARCH_KEYWORD_LENGTH ? [] : searchHistory}
						onSelectResult={handleSelectResult}
						isSearching={isSearching}
						showMinLengthWarning={showMinLengthWarning}
						onCloseWarning={() => setShowMinLengthWarning(false)}
					/>
				)}

				{isMapMode
					? displayMapView()
					: location && (
							<OffersList
								testID="offers-list"
								currentLocation={location}
								selectedType={selectedType}
								setSelectedType={setSelectedType}
								navigation={navigation}
								searchKeyword={finalSearchKeyword}
								onResetToInitialState={handleResetToInitialState}
								setNoOffersInList={setNoOffersInList}
							/>
					  )}

				{(!hasSearched || (!noSearchResults && !noOffersInList)) && (
					<ViewModeButton
						testID="view-mode-button"
						customStyle={styles.viewModeButton}
						mapMode={isMapMode}
						onPressHandler={switchViewMode}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}

export function OffersStack({}: { navigation: any }) {
	const { t } = useTranslation('common');

	return (
		<Stack.Navigator
			screenOptions={{
				headerShadowVisible: false,
				...headerOptions,
				headerStyle: {
					shadowColor: 'transparent'
				}
			}}>
			<Stack.Screen
				name="Offers"
				component={Offers}
				options={{
					title: t('navigation.offers')
				}}
			/>
			<Stack.Screen
				name={'OfferDetails'}
				component={OfferDetails}
				options={({ route }) => ({ title: route?.params?.offerTitle })}
			/>

			<Stack.Screen
				name={'DiscountCode'}
				component={DiscountCode}
				options={({ route }) => ({ title: route?.params?.offerTitle })}
			/>
		</Stack.Navigator>
	);
}
