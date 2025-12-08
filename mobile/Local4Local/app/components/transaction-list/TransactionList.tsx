import TransactionItem from '../transaction-item/TransactionItem';
import styles from './TransactionListStyle';
import { View, Text } from 'react-native';
import { OfferTransactionsGroupedDto } from '../../utils/types/offerTransactionGroupedDto';
import { useTranslation } from 'react-i18next';

export default function TransactionList({
	monthKey,
	transactions
}: {
	monthKey: string;
	transactions: OfferTransactionsGroupedDto[];
}) {
	const { t } = useTranslation('common');

	const formatMonthKey = (key: string): string => {
		const [year, month] = key.split('-');
		const translatedMonth = t(`months.${month}`);
		return `${translatedMonth} ${year}`;
	};

	return (
		<View style={styles.monthContainer}>
			<Text style={styles.monthHeader}>{formatMonthKey(monthKey)}</Text>

			{transactions.length > 0 ? (
				<View>
					{transactions.map((tx, index) => (
						<TransactionItem key={index} transaction={tx} />
					))}
				</View>
			) : (
				<View style={styles.noTransactiomnContainer}>
					<Text style={styles.noTransactionsText}>{t('transactions.noTransactionsThisMonth')}</Text>
				</View>
			)}
		</View>
	);
}
