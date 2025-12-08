import { CitizenGroupAge, CitizenGroupAgeMapping } from '../_enums/citizen-group-age.enum';
import { GenericStatusEnum } from '../_enums/generic-status.enum';

export class StatusUtil {
	public static mapStatusTranslationLabel(status: GenericStatusEnum): string {
		switch (status) {
			case GenericStatusEnum.ACTIVE:
				return 'status.active';
			case GenericStatusEnum.APPROVED:
				return 'status.approved';
			case GenericStatusEnum.REJECTED:
				return 'status.rejected';
			case GenericStatusEnum.EXPIRED:
				return 'status.expired';
			case GenericStatusEnum.PENDING:
				return 'status.pending';
			default:
				return '';
		}
	}

	public static getSvgIconForStatus(status: GenericStatusEnum): string {
		switch (status) {
			case GenericStatusEnum.ACTIVE:
			case GenericStatusEnum.APPROVED:
				return 'check-circle_b';
			case GenericStatusEnum.EXPIRED:
				return 'minus_b';
			case GenericStatusEnum.REJECTED:
				return 'cancel-circle_b';
			case GenericStatusEnum.PENDING:
				return 'clock_b';
			default:
				return '';
		}
	}

	public static getColorClassForStatus(status: GenericStatusEnum): string {
		switch (status) {
			case GenericStatusEnum.ACTIVE:
			case GenericStatusEnum.APPROVED:
				return 'active';
			case GenericStatusEnum.EXPIRED:
				return 'expired';
			case GenericStatusEnum.REJECTED:
				return 'rejected';
			case GenericStatusEnum.PENDING:
				return 'pending';
			default:
				return '';
		}
	}

	public static getSvgIconForIsAnswerYesNo(isAnswerYesNo: boolean): string {
		return isAnswerYesNo ? 'check-circle_b' : 'cancel-circle_b';
	}

	public static getColorClassForIsAnswerYesNo(isAnswerYesNo: boolean): string {
		return isAnswerYesNo ? 'active' : 'expired';
	}

	public static getMessagesForIsAnswerYesNo(isAnswerYesNo: boolean): string {
		return isAnswerYesNo ? 'general.yes' : 'general.no';
	}

	public static getCitizenGroupAgeLabelFromEnum(ageGroups: CitizenGroupAge[]): string[] {
		return ageGroups.map((ageGroup) =>
			ageGroup === CitizenGroupAge.UNDER_18
				? 'citizenGroup.under18'
				: CitizenGroupAgeMapping().get(ageGroup) || '',
		);
	}
}
