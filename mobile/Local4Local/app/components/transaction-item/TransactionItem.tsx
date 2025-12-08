import { View, Text, Image } from 'react-native';
import { OfferTransactionsGroupedDto } from '../../utils/types/offerTransactionGroupedDto';
import { useTranslation } from 'react-i18next';
import styles from './TransactionItemStyle';
import { OFFER_TYPES_IMAGES } from '../../utils/constants/constants';
import CoinsIcon from '../../assets/icons/coins.svg';
import React from 'react';
import { colors } from '../../common-style/Palette';

export default function TransactionItem({ transaction }: { transaction: OfferTransactionsGroupedDto }) {
	const { t } = useTranslation('common');
	const icon = OFFER_TYPES_IMAGES[transaction.offerType.offerTypeId - 1];
	return (
		<View style={styles.transactionItemContainer}>
			<View style={styles.iconColumn}>
				<Image 
					source={icon} 
					style={[styles.icon, { resizeMode: 'contain' }]} 
				/>
				<Text style={styles.transactionDate}>{transaction.createdDate}</Text>
			</View>
			<View style={styles.transactionDetails}>
				<Text style={styles.transactionTitle} numberOfLines={1}>
					{transaction.offerTitle}
				</Text>
				<Text style={styles.transactionSupplier} numberOfLines={1}>
					{transaction.supplierName}
				</Text>
			</View>

			<View style={styles.transactionAmountWrapper}>
				<Text style={{ color: colors.GREY_SCALE_7 }}>{'- '}</Text>
				<CoinsIcon fill={colors.GREY_SCALE_7} width="12" height="12" />
				<Text style={[styles.transactionAmount]}>{Math.abs(transaction.amount).toLocaleString()}</Text>
			</View>
		</View>
	);
}
