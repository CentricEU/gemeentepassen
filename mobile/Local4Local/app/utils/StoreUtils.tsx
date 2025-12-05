import { colors } from "../common-style/Palette";
import { WorkingHourDto } from "./types/workingHourDto";

export default class StoreUtils {

	static getStoreStatus = (hour: number, closingHour: string): string => {
		if (!closingHour || hour >= Number.parseFloat(closingHour)) {
			return "store.closed";
		}

		return "store.open";
	}

	static getCurrentWorkingDay = (workingHours: WorkingHourDto[], dayOfWeek: number): WorkingHourDto | undefined => {
		const currentWorkingDay = workingHours.find((item: WorkingHourDto) => item.day === dayOfWeek);
		if (!currentWorkingDay) {
			return;
		}

		return currentWorkingDay;
	}

	static getStoreStatusColor(hour: number, closingHour: string): string {
		const storeStatus = this.getStoreStatus(hour, closingHour);
		return storeStatus === "store.open" ? colors.SUCCESS : colors.STATUS_DANGER_500;
	}

}
