import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { BenefitLightDto } from '../../utils/types/benefitLightDto';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';
import { colors } from '../../common-style/Palette';
import style from './BenefitCardStyle';
import DateUtils from '../../utils/DateUtils';
import i18n from '../../../i18n';

interface BenefitCardProps {
	benefit: BenefitLightDto;
}

const BenefitCard = ({ benefit }: BenefitCardProps) => {
	const { t } = useTranslation('common');

	const { name, amount, expirationDate, status } = benefit;
	const isActive = status === 'ACTIVE';

	const contentStyle: StyleProp<ViewStyle> = [
		style.content,
		{
			backgroundColor: isActive ? colors.GREY_SCALE_O : colors.GREY_SCALE_50,
			width: '100%'
		}
	];

	const spentPercentage = benefit.spentPercentage;
	const remainingAmount = benefit.remainingAmount;

	const localeMap: Record<string, string> = { en: 'en-US', nl: 'nl-NL' };
	const locale = localeMap[i18n.language] || 'en-US';

	const getStyle = <T extends object>(activeStyle: T, disabledStyle: T) => (isActive ? activeStyle : disabledStyle);
	const formatCurrency = (amt: number | string) =>
		Number(amt).toLocaleString(locale, { style: 'currency', currency: 'EUR' });
	const getProgressColor = (percent: number) => {
		if (!isActive) return colors.GREY_SCALE_300;
		if (percent <= 0.5) return colors.SUCCESS;
		if (percent <= 0.8) return colors.STATUS_WARNING_500;
		return colors.STATUS_DANGER_500;
	};

	const expirationDateText = DateUtils.convertDateFormat(
		typeof expirationDate === 'string' ? expirationDate : expirationDate.toISOString().slice(0, 10)
	);

	const BenefitRow = ({
		label,
		value,
		labelStyle,
		valueStyle
	}: {
		label: string;
		value: string;
		labelStyle: any;
		valueStyle: any;
	}) => (
		<View style={style.rowBetween}>
			<Text style={labelStyle}>{label}</Text>
			<Text style={valueStyle}>{value}</Text>
		</View>
	);

	return (
		<View style={contentStyle} testID="benefit-card">
			<View style={style.headerContainerListView}>
				<View style={style.cardBody}>
					{/* Title Row */}
					<View style={style.rowBetween}>
						<Text
							style={[getStyle(style.boldText, style.disabledBoldText), { flex: 1 }]}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{name}
						</Text>

						<Text style={getStyle(style.totalAmountText, style.disabledTotalAmountText)}>
							{formatCurrency(amount)}
						</Text>
					</View>


					{/* Expiration Date */}
					<View style={style.row}>
						<Text style={getStyle(style.validUntilText, style.disabledValidUntilText)}>
							{t('benefits.validUntil')}{' '}
						</Text>
						<Text
							style={getStyle(style.expirationDateText, style.disabledExpirationDateText)}
							testID="benefit-expiration-date">
							{expirationDateText}
						</Text>
					</View>

					{/* Usage */}
					<BenefitRow
						label={t('benefits.usage')}
						value={`${spentPercentage.toFixed(2)}%`}
						labelStyle={getStyle(style.usageText, style.disabledUsageText)}
						valueStyle={getStyle(style.percentageText, style.disabledPercentageText)}
					/>

					{/* Progress  */}
					<ProgressBar
						progress={spentPercentage / 100}
						color={getProgressColor(spentPercentage / 100)}
						style={style.progressBar}
					/>

					{/* Remaining Amount */}
					<Text
						style={getStyle(style.remainingText, style.disabledRemainingText)}
						testID="benefit-remaining-amount">
						{t('benefits.remainingAmount', {
							amount: formatCurrency(Number(remainingAmount.toFixed(2))),
						})}
					</Text>
				</View>
			</View>
		</View>
	);
};

export default BenefitCard;
