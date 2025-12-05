import { ScrollView, View } from "react-native";
import { styles } from "./OfferDetailsStyle";
import OfferChip from "../../components/offer-chip/OfferChip";
import GrantChip from "../../components/grant-chip/GrantChip";
import GenericButton from "../../components/generic-button/GenericButton";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import GenericInformationBlock from "../../components/generic-information-block/GenericInformationBlock";
import SupplierInfo from "../../components/supplier-info/SupplierInfo";
import { OfferTypeEnum } from "../../utils/enums/offerTypeEnum";
import DateUtils from "../../utils/DateUtils";
import { GenericInformationBlockChild } from "../../utils/types/genericInformationBlockChild";
import { useContext, useEffect, useState } from "react";
import { frequencyOfUse } from "../../utils/constants/frequencyOfUseText";
import { FrequencyOfUseEnum } from "../../utils/enums/frequencyOfUseEnum";
import { useTranslation } from "react-i18next";
import OfferService from "../../services/OfferService";
import { UseOfferDto } from "../../utils/models/UseOfferDto";
import CustomToaster from "../../components/error-toaster/CustomToaster";
import { WorkingHourDto } from "../../utils/types/workingHourDto";
import { OfferMobileDetailDto } from "../../utils/types/offerMobileDetailDto";
import { TimeZoneEnum } from "../../utils/enums/timeZoneEnum";
import { ToasterTypeEnum } from "../../utils/enums/toasterTypeEnum";
import { LocationContext } from "../../contexts/location/location-provider";
import { NavigationEnum } from "../../utils/enums/navigationEnum";

export default function OfferDetails({ route, navigation }: any) {
	const { t } = useTranslation("common");
	const [offer, setOffer] = useState<any>(null);
	const [shouldDisplayToaster, setShouldDisplayToaster] = useState(false);
	const [toasterMessage, setToasterMessage] = useState("");
	const [toasterType, setToasterType] = useState(ToasterTypeEnum.ERROR);

	const { location } = useContext(LocationContext);

	useEffect(() => {
		getFullOffer();
	}, []);

	useEffect(() => {
		computeErrorMessage();
	}, [offer]);

	const getFullOffer = async () => {
		try {
			if (!location) {
				return;
			}

			const offer: OfferMobileDetailDto = await OfferService.getFullOffer(
				route.params.offerId,
				location.latitude.toString(),
				location.longitude.toString()
			);
			setOffer(offer);

			if (!offer.isActive) {
				setButtonText(t("offerRestriction.notAvailableNow"));
				setShouldDisableButton(true);
				setShouldDisplayToaster(true);
				setToasterMessage(
					t("offerDetailsPage.inactive", {
						startDate: new Date(offer.startDate).toLocaleDateString(
							"en-GB"
						),
					})
				);
				return;
			}

			setButtonText(
				offer.discountCode
					? t("offerDetailsPage.seeDiscountCode")
					: t("offerDetailsPage.getOffer")
			);
		} catch (error) {
			console.error(error);
		}
	};

	const getOfferDetails = (): GenericInformationBlockChild[] => {
		return [
			{
				label: t("offerDetailsPage.description"),
				textValue: offer.description,
			},
			getOfferAmount(),
			getOfferGrants(),
			{
				label: t("offerDetailsPage.validFrom"),
				displayWarningSign: !offer.isActive,
				textValue: t("offerDetailsPage.validity", {
					startDate: DateUtils.convertDateFormat(offer.startDate),
					endDate: DateUtils.convertDateFormat(offer.expirationDate),
				}),
			},
		];
	};

	const useOffer = async () => {
		try {
			if (!offer.discountCode) {
				const currentTime = new Date();
				const currentTimeString = currentTime
					.toTimeString()
					.split(" ")[0];
				const useOfferDto = new UseOfferDto(
					offer.id,
					currentTimeString
				);

				setShouldDisplayToaster(false);
				await OfferService.useOffer(useOfferDto);
			}

			navigation.navigate(NavigationEnum.discountCode, {
				offerId: offer.id,
				offerTitle: offer.title,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const getOfferGrants = (): GenericInformationBlockChild => {
		return {
			label: t("offerDetailsPage.acceptedGrants"),
			componentValue: () => (
				<View style={styles.grantsList}>
					{offer.grants &&
						offer.grants.map((grant: any) => (
							<GrantChip key={grant.id} label={grant.title} />
						))}
				</View>
			),
		};
	};

	const getOfferAmount = (): GenericInformationBlockChild => {
		const offerAmount = offer.amount;
		let formattedAmount = "";

		switch (offer.offerType.offerTypeId) {
			case OfferTypeEnum.percentage:
				formattedAmount = `${offerAmount}%`;
				break;
			case OfferTypeEnum.bogo:
				formattedAmount = t("offerDetailsPage.bogo");
				break;
			case OfferTypeEnum.freeEntry:
			case OfferTypeEnum.credit:
				formattedAmount = `€${offerAmount}`;
				break;
		}

		return {
			label: t("offerDetailsPage.amount"),
			textValue: formattedAmount,
		};
	};

	const checkFrequencyOfUse = (): boolean => {
		if (!offer?.restrictions) {
			return false;
		}

		if (!offer.lastOfferTransaction?.usageTime) {
			return false;
		}

		switch (offer.restrictions?.frequencyOfUse) {
			case FrequencyOfUseEnum.DAILY:
				return !DateUtils.isDateBeforeToday(
					offer.lastOfferTransaction?.usageTime as Date
				);
			case FrequencyOfUseEnum.MONTHLY:
				return !DateUtils.isDateBeforeMonth(
					offer.lastOfferTransaction?.usageTime as Date
				);
			case FrequencyOfUseEnum.WEEKLY:
				return !DateUtils.isDateBeforeWeek(
					offer.lastOfferTransaction?.usageTime as Date
				);
			case FrequencyOfUseEnum.YEARLY:
				return !DateUtils.isDateBeforeYear(
					offer.lastOfferTransaction?.usageTime as Date
				);
			case FrequencyOfUseEnum.SINGLE_USE:
				return !!offer.lastOfferTransaction;
			default:
				return false;
		}
	};

	const shouldDisplayTimeSlotsError = (): boolean => {
		if (!offer.restrictions?.timeFrom || !offer.restrictions?.timeTo) {
			return false;
		}

		if (!isInAllowedTimezone()) {
			return true;
		}

		return !DateUtils.isTimeBetweenSlots(
			offer.restrictions?.timeFrom as string,
			offer.restrictions?.timeTo as string
		);
	};

	const isInAllowedTimezone = (): boolean => {
		//To-DO for now we'll accept RO timezone and NL timezone.
		return (
			DateUtils.checkUserTimezone(TimeZoneEnum.NL) ||
			DateUtils.checkUserTimezone(TimeZoneEnum.RO)
		);
	};

	const computeErrorMessage = (): void => {
		if (!offer?.restrictions || offer?.discountCode) {
			return;
		}

		if (checkFrequencyOfUse()) {
			computeErrorMessageForUseFrequency();
			setCustomToasterState(ToasterTypeEnum.ERROR, toasterMessage);
			setButtonText(t("offerRestriction.offerUsed"));
			setShouldDisableButton(true);
			return;
		}

		if (shouldDisplayTimeSlotsError()) {
			const messageTimeSlots = t("offerRestriction.timeSlotsWarning", {
				startHour: offer.restrictions.timeFrom
					.toString()
					.substring(0, 5),
				endHour: offer.restrictions.timeTo.toString().substring(0, 5),
			});
			setCustomToasterState(ToasterTypeEnum.ERROR, messageTimeSlots);
			setShouldDisableButton(true);
			setButtonText(t("offerRestriction.notAvailableNow"));
			return;
		}

		setButtonText(
			offer.discountCode
				? t("offerDetailsPage.seeDiscountCode")
				: t("offerDetailsPage.getOffer")
		);
		setShouldDisableButton(false);
	};

	const setCustomToasterState = (
		toasterType: ToasterTypeEnum,
		message?: string
	): void => {
		setShouldDisplayToaster(true);
		setToasterType(toasterType);
		if (!message) {
			return;
		}
		setToasterMessage(message);
	};

	const computeErrorMessageForUseFrequency = (): void => {
		let errorMessageFreq;
		switch (offer.restrictions?.frequencyOfUse) {
			case FrequencyOfUseEnum.DAILY:
				errorMessageFreq = t("offerRestriction.alreadyUsedToday");
				break;
			case FrequencyOfUseEnum.MONTHLY:
				errorMessageFreq = t("offerRestriction.alreadyUsedMonth");
				break;
			case FrequencyOfUseEnum.WEEKLY:
				errorMessageFreq = t("offerRestriction.alreadyUsedWeek");
				break;
			case FrequencyOfUseEnum.YEARLY:
				errorMessageFreq = t("offerRestriction.alreadyUsedYear");
				break;
			case FrequencyOfUseEnum.SINGLE_USE:
				errorMessageFreq = t("offerRestriction.alreadyUsed");
				break;
			default:
				break;
		}
		setToasterMessage(errorMessageFreq as string);
	};

	const getRestrictions = (): GenericInformationBlockChild[] | null => {
		if (!offer.restrictions) {
			return null;
		}

		let restrictions: GenericInformationBlockChild[] = [];

		if (offer.restrictions.frequencyOfUse in FrequencyOfUseEnum) {
			const hasWarning = checkFrequencyOfUse();
			restrictions.push({
				label: t("offerDetailsPage.frecquency"),
				displayWarningSign: hasWarning,
				textValue: frequencyOfUse[offer.restrictions.frequencyOfUse],
			});
		}

		if (offer.restrictions.timeFrom && offer.restrictions.timeTo) {
			const hasWarning = shouldDisplayTimeSlotsError();
			restrictions.push({
				label: t("offerDetailsPage.timeSlots"),
				displayWarningSign: hasWarning,
				textValue: t("offerDetailsPage.hourValidity", {
					startHour: offer.restrictions.timeFrom
						.toString()
						.substring(0, 5),
					endHour: offer.restrictions.timeTo
						.toString()
						.substring(0, 5),
				}),
			});
		}

		if (offer.restrictions.ageRestriction) {
			restrictions.push({
				label: t("offerDetailsPage.ageRestriction"),
				textValue: t("offerDetailsPage.above", {
					years: offer.restrictions.ageRestriction,
				}),
			});
		}

		if (offer.restrictions.minPrice && offer.restrictions.maxPrice) {
			restrictions.push({
				label: t("offerDetailsPage.price"),
				textValue: t("offerDetailsPage.priceRange", {
					startPrice: offer.restrictions.minPrice,
					endPrice: offer.restrictions.maxPrice,
				}),
			});
		}

		return restrictions;
	};

	const [buttonText, setButtonText] = useState<string>("");
	const [shouldDisableButton, setShouldDisableButton] = useState(false);
	const [paddingBottom, setPaddingBottom] = useState({
		paddingBottom: 148,
	});

	const handleCloseErrorMessage = () => {
		setShouldDisplayToaster(false);
		setPaddingBottom({
			paddingBottom: 80,
		});
	};

	return (
		<>
			{offer ? (
				<ScrollView
					style={styles.offerDetailsPage}
					contentContainerStyle={[
						styles.offerDetailsContent,
						paddingBottom,
					]}
				>
					<SupplierInfo
						name={offer.companyName}
						logo={offer.companyLogo}
						address={offer.companyAddress}
						category={offer.companyCategory}
						workingHours={offer.workingHours.filter(
							(item: WorkingHourDto) => item.isChecked
						)}
					/>
					<GenericInformationBlock
						title={t("offerDetailsPage.title")}
						headerRight={
							<OfferChip typeId={offer.offerType.offerTypeId} />
						}
						children={getOfferDetails()}
					/>
					{offer.restrictions ? (
						<GenericInformationBlock
							title={t("offerDetailsPage.restrictions")}
							children={getRestrictions()}
						/>
					) : null}
				</ScrollView>
			) : null}

			<View style={styles.getOfferButtonContainer}>
				{shouldDisplayToaster && (
					<CustomToaster
						message={toasterMessage}
						onClose={handleCloseErrorMessage}
						toasterType={toasterType}
					/>
				)}

				<GenericButton
					type={ButtonTypeEnum.primary}
					text={buttonText}
					onPressHandler={useOffer}
					disabled={shouldDisableButton}
				/>
			</View>
		</>
	);
}
