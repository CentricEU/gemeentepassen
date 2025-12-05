import { ProfileLabelDto } from './profile_label-dto.model';

export class CategoryDto {
	public id: number;
	public categoryLabel: string;
	public subcategoryLabels: ProfileLabelDto[];

	constructor(id: number, categoryLabel: string, subcategoryLabels: ProfileLabelDto[]) {
		this.id = id;
		this.categoryLabel = categoryLabel;
		this.subcategoryLabels = subcategoryLabels;
	}
}
