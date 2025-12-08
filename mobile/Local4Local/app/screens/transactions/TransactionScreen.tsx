import Stack from '../../navigations/StackNavigator';
import { headerOptions } from '../../components/header/GlobalHeader';
import { useCallback, useState } from 'react';
import { View, FlatList, SafeAreaView } from 'react-native';
import TransactionList from '../../components/transaction-list/TransactionList';
import SearchNoResults from '../../components/search-no-results/SearchNoResults';
import OfferTransactionService from '../../services/TransactionService';
import { OfferTransactionsGroupedDto } from '../../utils/types/offerTransactionGroupedDto';
import styles from './TransactionsStyle';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

export function Transactions({ navigation }: { navigation: any }) {
	const [transactionsGrouped, setTransactionsGrouped] = useState<Record<string, OfferTransactionsGroupedDto[]>>({});
	const [currentPage, setCurrentPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	// const [searchQuery, setSearchQuery] = useState<string>('');

	const fetchTransactions = async (page: number) => {
		if (isLoading) return;

		setIsLoading(true);

		try {
			const response = await OfferTransactionService.getUserTransactionsGrouped(page);

			if (Object.values(response).flat().length === 0) {
				setHasMore(false);
				return;
			}
			setTransactionsGrouped((prev) => {
				const newData = { ...prev };
				for (const key in response) {
					newData[key] = [...(newData[key] || []), ...response[key]];
				}
				return newData;
			});
		} catch (error) {
			console.error('Failed fetching transactions:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			setTransactionsGrouped({});
			setCurrentPage(0);
			setHasMore(true);

			fetchTransactions(0);
			return () => { };
		}, [])
	);

	const allMonthsEmpty = Object.values(transactionsGrouped).every((arr) => arr.length === 0);

	const loadMore = () => {
		if (hasMore && !isLoading) {
			const nextPage = currentPage + 1;
			setCurrentPage(nextPage);
			fetchTransactions(nextPage);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* <SearchBar
				value={searchQuery}
				changeTextHandler={setSearchQuery}
				placeholder={'search.searchBarTextTransactions'}
				hideFilterButton={true}
				disableFocus={true}
			/> */}

			{allMonthsEmpty && !isLoading ? (
				<SearchNoResults
					titleKey={'transactions.noTransactionsTitle'}
					descriptionKey={'transactions.noTransactionsDescription'}
					onResetToInitialState={() => navigation.navigate('OffersStack')}
				/>
			) : (
				<FlatList
					testID="transactions-flat-list"
					data={Object.entries(transactionsGrouped)}
					keyExtractor={([key]) => key}
					renderItem={({ item: [monthKey, transactions] }) => (
						<TransactionList monthKey={monthKey} transactions={transactions} />
					)}
					onEndReached={loadMore}
					onEndReachedThreshold={0.3}
				/>
			)}
		</SafeAreaView>
	);
}

export function TransactionsStack({ }: { navigation: any }) {
	const { t } = useTranslation('common');

	return (
		<Stack.Navigator
			screenOptions={{
				...headerOptions,
				headerShadowVisible: false,
				headerStyle: {
					shadowColor: 'transparent'
				}
			}}>
			<Stack.Screen
				name="Transactions"
				component={Transactions}
				options={{
					title: t('navigation.transactions')
				}}
			/>
		</Stack.Navigator>
	);
}
