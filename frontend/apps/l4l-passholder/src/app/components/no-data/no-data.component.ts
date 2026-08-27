//     Will use it until migrate to standalone for Supplier/Municipality.
//     Will be removed afterwards since it's duplicated but the other one it's
//     not standalone and other dependend components will need to be migrated to standalone
import { Component, Input } from '@angular/core';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-no-data',
	imports: [TranslateModule, WindmillModule],
	templateUrl: './no-data.component.html',
	styleUrls: ['./no-data.component.scss'],
	standalone: true,
})
export class NoDataComponent {
	@Input() noDataTitle: string;
	@Input() noDataDescription: string;
	@Input() translateParams: { [key: string]: string } = {};
	@Input() imageName = 'no_data.svg';

	private imagePath = '/assets/images/';

	public getImagePath(): string {
		return `${this.imagePath}${this.imageName}`;
	}
}
