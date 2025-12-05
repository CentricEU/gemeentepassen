import { CategoryDto } from './category-dto.model';
import { ProfileLabelDto } from './profile_label-dto.model';

export class ProfileDropdownsDto {
	public categories: CategoryDto[];
	public legalFormLabels: ProfileLabelDto[];
	public groupLabels: ProfileLabelDto[];

	constructor(categories: CategoryDto[], legalFormLabels: ProfileLabelDto[], groupLabels: ProfileLabelDto[]) {
		this.categories = categories;
		this.legalFormLabels = legalFormLabels;
		this.groupLabels = groupLabels;
	}
}
