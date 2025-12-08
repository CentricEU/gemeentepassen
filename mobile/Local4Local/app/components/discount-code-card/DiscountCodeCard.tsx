import DateUtils from '../../utils/DateUtils';
import SupplierLogoCard from '../supplier-logo-card/SupplierLogoCard';
import { View, Text, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { DiscountCodeDto } from '../../utils/types/discountCode';
import { useTranslation } from 'react-i18next';
import style from './DiscountCodeCardStyle';
import { colors } from '../../common-style/Palette';
import { OfferType } from '../../utils/types/offerType';
import { isTablet } from '../../utils/HelperUtils';

const Header = ({
	logo,
	companyName,
	isDiscountsListView,
	isActive
}: {
	logo: string;
	companyName: string;
	isDiscountsListView: boolean;
	isActive: boolean;
}) => (
	<View style={isDiscountsListView ? style.headerContainerListView : style.headerContainer}>
		<SupplierLogoCard logo={logo} />
		<Text style={isActive ? style.title : style.disabledTitle}>{companyName}</Text>
	</View>
);

const Details = ({
	offerType,
	expirationDate,
	isActive,
	amount,
	isListView
}: {
	offerType: OfferType;
	expirationDate: string;
	isActive: boolean;
	amount: number;
	isListView?: boolean;
}) => {
	const { t } = useTranslation('common');

	const offerText = () => {
		switch (offerType.offerTypeId) {
			case 2:
			case 4:
				return t(offerType.offerTypeLabel);
			case 3:
				return `€ ${amount} ${t(offerType.offerTypeLabel)}`;
			default:
				return `${amount}% ${t('discounts.discount')}`;
		}
	};

	const expirationDateText = DateUtils.convertDateFormat(expirationDate);

	const renderText = (style: any, text: any) => (
		<Text style={style} testID="details-text">
			{text}
		</Text>
	);

	const renderDetails = () => (
		<>
			<View style={style.flexDirectionRow}>
				{renderText(isActive ? style.boldText : style.disabledBoldText, `${t('offer.offerType')}`)}
				{renderText(isActive ? style.enabled : style.disabled, ` ${offerText()}`)}
			</View>
			<View style={{ height: 4 }} />
			<View style={style.flexDirectionRow}>
				{renderText(isActive ? style.boldText : style.disabledBoldText, `${t('offer.expirationDate')}`)}
				{renderText(isActive ? style.enabled : style.disabled, `${expirationDateText}`)}
			</View>
		</>
	);

	const renderListViewDetails = () => (
		<View style={style.detailsContainerListView}>
			<View style={style.offerTypeText}>
				{renderText(isActive ? style.offerTypeListView : style.disabledOfferTypeListView, offerText())}
			</View>
			<View style={style.expirationDateContainer}>
				{renderText(
					isActive ? style.expirationDateListView : style.disabledExpirationDateListView,
					t('discounts.expirationDate')
				)}
				{renderText(isActive ? style.boldText : style.disabledBoldText, expirationDateText)}
			</View>
		</View>
	);

	return isListView ? renderListViewDetails() : renderDetails();
};

const CodeDisplay = ({ code }: { code: string }) => (
	<View style={style.codeContainer}>
		<Text style={style.code} testID="discount-code">
			{code.replace(/(.)(?=.*)/g, '$1 ')}
		</Text>
	</View>
);

const DiscountCodeCard = ({
	discountCode,
	isDiscountsListView
}: {
	discountCode: DiscountCodeDto;
	isDiscountsListView?: boolean;
}) => {
	const { t } = useTranslation('common');

	const offerDetailsMap: Record<number, { backgroundColor: string }> = {
		1: { backgroundColor: colors.INFO_400 },
		2: { backgroundColor: colors.WARNING_900 },
		3: { backgroundColor: colors.DANGER_400 },
		4: { backgroundColor: colors.VIOLET }
	};

	const backgroundColor = discountCode.isActive
		? offerDetailsMap[discountCode.offerType.offerTypeId]?.backgroundColor || colors.SURFACE_50
		: colors.GREY_SCALE_50;
	const screenWidth = Dimensions.get('window').width;

	const contentStyle: StyleProp<ViewStyle> = [
		style.content,
		{
			backgroundColor,
			width: isTablet() && !isDiscountsListView ? screenWidth * 0.6 : '100%'
		}
	];

	const content = (
		<View style={contentStyle} testID={isDiscountsListView ? 'content-view-list' : 'content-view'}>
			<Header
				logo={discountCode.companyLogo}
				companyName={discountCode.companyName}
				isDiscountsListView={!!isDiscountsListView}
				isActive={discountCode.isActive}
			/>
			<Details
				offerType={discountCode.offerType}
				expirationDate={discountCode.expirationDate.toString()}
				isActive={discountCode.isActive}
				amount={discountCode.amount}
				isListView={!!isDiscountsListView}
			/>
			{!isDiscountsListView && (
				<>
					<CodeDisplay code={discountCode.code} />
					<Text style={discountCode.isActive ? style.footerText : style.disabledFooterText}>
						{t('offer.useCode')}
					</Text>
				</>
			)}
		</View>
	);

	return content;
};

export default DiscountCodeCard;
