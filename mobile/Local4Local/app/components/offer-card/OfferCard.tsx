import { Card } from 'react-native-paper';
import { memo, useContext, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, View, ViewStyle } from 'react-native';
import OfferChip from '../offer-chip/OfferChip';
import BenefitChip from '../benefit-chip/BenefitChip';
import ArrowRightRegularIcon from '../../assets/icons/chevron-large-right_r.svg';
import OfferStoreDetails from '../offer-store-details/OfferStoreDetails';
import styles from './OfferCardStyle';
import GenericButton from '../generic-button/GenericButton';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { NavigationEnum } from '../../utils/enums/navigationEnum';
import OfferContext from '../../contexts/offer/offer-context';
import { OfferMobileListDto } from '../../utils/types/offerMobileListDto';
import ExclamationTriangle from '../../assets/icons/exclamation-triangle_b.svg';
import { colors } from '../../common-style/Palette';
import { useTranslation } from 'react-i18next';

interface OfferCardProps {
	navigation?: any;
	offer: OfferMobileListDto;
	customStyle?: ViewStyle;
	isOnMap?: boolean;
}

function OfferCard({ navigation, offer, customStyle, isOnMap }: OfferCardProps) {
	const [shouldScroll, setShouldScroll] = useState(true);
	const { t } = useTranslation('common');

	const computeShouldScroll = (width: number) => {
		setShouldScroll(width >= Dimensions.get('window').width - 64);
	};
	const { offerState, setOfferState } = useContext(OfferContext);

	const handleNavigateForMap = () => {
		const newState = { ...offerState, isDisplayed: false };
		setOfferState(newState);
		navigation?.navigate(NavigationEnum.offerDetails, {
			offerId: offer.id,
			offerTitle: offer.title
		});
	};

	return (
		offer && (
			<Pressable
				onPress={() => {
					if (isOnMap) {
						return;
					}
					navigation?.navigate(NavigationEnum.offerDetails, {
						offerId: offer.id,
						offerTitle: offer.title
					});
				}}
				testID={'offer-card-wrapper'}>
				<Card style={[styles.offerCard, customStyle]} elevation={Platform.OS === 'android' ? 1 : 0}>
					{!offer.isActive && (
						<View style={styles.offerInactive}>
							<ExclamationTriangle
								fill={colors.STATUS_DANGER_500}
								width={18}
								height={18}></ExclamationTriangle>
							<Text style={styles.inactiveOffertext}>
								{t('offersPage.availableWith', {
									startDate: new Date(offer.startDate).toLocaleDateString('en-GB')
								})}
							</Text>
						</View>
					)}
					<ScrollView
						showsHorizontalScrollIndicator={false}
						horizontal={true}
						contentContainerStyle={styles.chipsContainer}
						onContentSizeChange={(width) => computeShouldScroll(width)}
						scrollEnabled={shouldScroll}
						testID={'chips-scrollview'}>
						<>
							<OfferChip typeId={offer.offerType.offerTypeId} />
							<Pressable style={styles.chipsContainer}>
								{offer.benefit && <BenefitChip key={offer.benefit.id} label={offer.benefit.name} />}
							</Pressable>
						</>
					</ScrollView>

					<View style={styles.offerCardBody}>
						<View style={styles.offerCardBodyText}>
							<Text style={styles.offerTitle}>{offer.title}</Text>
							<Text style={styles.offerDescription} numberOfLines={2}>
								{offer.description}
							</Text>
						</View>
						{!isOnMap && (
							<View style={styles.arrowContainer}>
								<ArrowRightRegularIcon height={24} />
							</View>
						)}
					</View>

					<View style={[styles.footerContainer]}>
						<OfferStoreDetails
							name={offer.companyName}
							distance={offer.distance}
							workingHours={offer.workingHours.filter((item) => item.isChecked)}
							isForMap={isOnMap}
						/>

						{isOnMap && (
							<View style={[styles.detailsButton]}>
								<GenericButton
									type={ButtonTypeEnum.primary}
									text="generic.buttons.viewDetails"
									onPressHandler={handleNavigateForMap}
								/>
							</View>
						)}
						{/* 
						<OfferStoreDetails
							name={offer.companyName}
							distance={offer.distance}
							workingHours={offer.workingHours.filter((item) => item.isChecked)}
							isForMap={isOnMap}
						/> */}
					</View>
				</Card>
			</Pressable>
		)
	);
}

export default memo(OfferCard);
