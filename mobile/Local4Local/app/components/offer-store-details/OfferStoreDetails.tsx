import { Text, View } from "react-native";
import DirectionsWalkIcon from "../../assets/icons/directions_walk.svg";
import { colors } from "../../common-style/Palette";
import styles from "./OfferStoreDetailsStyle";
import { WorkingHourDto } from "../../utils/types/workingHourDto";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import StoreUtils from "../../utils/StoreUtils";

export interface OfferStoreDetailsProps {
	name: string;
	distance: number;
	workingHours: WorkingHourDto[];
	isForMap?: boolean;
}

export default function OfferStoreDetails({ name, distance, workingHours, isForMap }: OfferStoreDetailsProps) {
	const { t } = useTranslation("common");
	const [currentWorkingDay, setCurrentWorkingDay] = useState<WorkingHourDto | undefined>();

	const currentDate = new Date();
	const dayOfWeek = currentDate.getDay();
	const hour = currentDate.getHours();

	useEffect(() => {
		getCurrentWorkingDay();
	}, []);


	const getCurrentWorkingDay = () => {
		const currentWorkingDay = StoreUtils.getCurrentWorkingDay(workingHours, dayOfWeek);
		setCurrentWorkingDay(currentWorkingDay);
	}

	const computeDistance = () => {
		if (distance >= 1000) {
			return `${Math.round((distance / 1000 + Number.EPSILON) * 100) / 100} km`;
		}
		return `${Math.round((distance + Number.EPSILON) * 100) / 100} m`;
	}

	return (
		<View style={!isForMap ? styles.detailsContainer : styles.detailsContainerForMap}>
			<Text style={styles.locationTitle}>{name}</Text>
			<View style={styles.locationDetails}>
				{currentWorkingDay && <Text style={[styles.locationStatus,
				{ color: StoreUtils.getStoreStatusColor(hour, currentWorkingDay?.closeTime!) }]}>
					{t(StoreUtils.getStoreStatus(hour, currentWorkingDay?.closeTime!))} •</Text>}
				<DirectionsWalkIcon width={16} height={16} fill={colors.GREY_SCALE} />
				<Text testID="distanceText" style={styles.locationStatus}>
					{computeDistance()}
				</Text>
			</View>
		</View>
	);
}

