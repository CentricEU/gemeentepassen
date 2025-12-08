import { styles } from "./SupplierInfoStyle";
import SupplierLogoCard from "../supplier-logo-card/SupplierLogoCard";
import { View } from "react-native";
import { Text } from "react-native-paper";
import ClockBoldIcon from '../../assets/icons/clock_b.svg';
import MapPinBoldIcon from '../../assets/icons/map-pin_b.svg';
import { colors } from "../../common-style/Palette";
import { useContext, useEffect, useState } from "react";
import { WorkingHourDto } from "../../utils/types/workingHourDto";
import DateUtils from "../../utils/DateUtils";
import { useTranslation } from "react-i18next";
import StoreUtils from "../../utils/StoreUtils";
import GenericAccordion from "../generic-accordion/GenericAccordion";
import BankHolidaysContext from "../../contexts/bank-holidays/bank-holidays-context";
import { BankHoliday } from "../../utils/types/bankHoliday";
import BankHolidaysService from "../../services/BankHolidaysService";

interface SupplierInfoProps {
	name: string,
	logo: string
	address: string,
	category: string,
	workingHours: WorkingHourDto[]
}

export default function SupplierInfo({ name, logo, address, workingHours, category }: SupplierInfoProps) {
	const { t } = useTranslation("common");
	const { bankHolidaysForCurrentYear, setBankHolidaysForCurrentYear } = useContext(BankHolidaysContext);

	useEffect(() => {
		getCurrentWorkingDay();
	}, []);

	const [currentWorkingDay, setCurrentWorkingDay] = useState<WorkingHourDto | undefined>();
	const [isHolidayToday, setIsHolidayToday] = useState(false);

	const currentDate = new Date();
	const dayOfWeek = currentDate.getDay();
	const hour = currentDate.getHours();


	useEffect(() => {
		const currentYear = new Date().getFullYear();
		if (bankHolidaysForCurrentYear && bankHolidaysForCurrentYear[0]?.year == currentYear) {
			return;
		}
		getBankHolidaysForYear(currentYear);
	}, []);

	useEffect(() => {
		setIsHolidayToday(checkIfTodayIsHoliday());
	}, [bankHolidaysForCurrentYear]);

	const checkIfTodayIsHoliday = () => {
		return bankHolidaysForCurrentYear.some(holiday => DateUtils.isToday(new Date(holiday.date)))
	}

	const getBankHolidaysForYear = async (year: number) => {
		try {
			const bankHolidays: BankHoliday[] = await BankHolidaysService.getHolidays(year);
			setBankHolidaysForCurrentYear(bankHolidays);
		} catch (error) {
			console.error(error);
		}
	};

	const getStoreText = (closingHour: string): string => {

		const nextWork = getNextWorkingDay();
		const nextWorkDayString = DateUtils.getDayString(nextWork?.day!)
		const nextDayTranslated = t(nextWorkDayString);

		if (!closingHour || hour >= Number.parseFloat(closingHour)) {
			return t("store.opensAt", { day: nextDayTranslated, hour: nextWork?.openTime?.substring(0, 5) });
		}
		return t("store.closesAt", { hour: closingHour?.substring(0, 5) });
	}


	const getCurrentWorkingDay = () => {
		const currentWorkingDay = StoreUtils.getCurrentWorkingDay(workingHours, dayOfWeek);
		setCurrentWorkingDay(currentWorkingDay);
	}

	const getNextWorkingDay = () => {
		const currentIndex = workingHours.findIndex((item: WorkingHourDto) => item.day === dayOfWeek);
		const nextIndex = (currentIndex + 1) % workingHours.length;
		return workingHours[nextIndex];
	}

	const fullWeekArray: (WorkingHourDto | null)[] = new Array(7).fill(null);
	for (const workingHour of workingHours) {
		fullWeekArray[workingHour.day - 1] = workingHour;
	}

	const openHoursTitle =
		<View style={styles.supplierRow}>
			<ClockBoldIcon fill={colors.GREY_SCALE} style={{ marginTop: 4 }} />
			<Text style={styles.supplierInformationText}>
				<Text style={{ color: StoreUtils.getStoreStatusColor(hour, currentWorkingDay?.closeTime!) }}>
					{t(StoreUtils.getStoreStatus(hour, currentWorkingDay?.closeTime!))}</Text>
				{getStoreText(currentWorkingDay?.closeTime!)}
			</Text>

		</View>;

	const openHours =
		<>
			{
				fullWeekArray.map((workingHoursDay, index: number) => (
					<View style={styles.daySchedule} key={index}>
						<Text> {t(`dayOfWeek.${index + 1}`)}</Text>
						{workingHoursDay ?
							<Text style={styles.dayHours}> {workingHoursDay?.openTime?.substring(0, 5)} - {workingHoursDay?.closeTime?.substring(0, 5)} </Text> :
							<Text style={styles.dayHours}> {t('store.closed')} </Text>
						}

					</View>
				))
			}
		</>

	return (
		<>
			<View style={styles.supplierDetails}>
				<SupplierLogoCard logo={logo} />
				<View style={{ flex: 1 }}>
					<Text style={styles.supplierName}>{name}</Text>
					<Text style={styles.supplierCategory}>{t(category)}</Text>
				</View>
			</View>
			<View style={styles.supplierInformation}>
				<GenericAccordion title={openHoursTitle} children={openHours} />
				{isHolidayToday &&
					<Text style={styles.holidayWarning}>
						{t('store.bankHolidaysWarning')}
					</Text>
				}
				<View style={styles.supplierRow}>
					<MapPinBoldIcon fill={colors.GREY_SCALE} style={{ marginTop: 4 }} />
					<Text style={styles.supplierInformationText}>{address}</Text>
				</View>
			</View>
		</>
	);
}
