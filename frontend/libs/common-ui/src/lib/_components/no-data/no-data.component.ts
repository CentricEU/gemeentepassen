import { Component, Input } from '@angular/core';

@Component({
	selector: 'frontend-no-data',
	templateUrl: './no-data.component.html',
	styleUrls: ['./no-data.component.scss'],
	standalone: false,
})
export class NoDataComponent {
	@Input() noDataTitle: string;
	@Input() noDataDescription: string;
	@Input() imageName = 'no_data.svg';

	private imagePath = '/assets/images/';

	public getImagePath(): string {
		return `${this.imagePath}${this.imageName}`;
	}
}
