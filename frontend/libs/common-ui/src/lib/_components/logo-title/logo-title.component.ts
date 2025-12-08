import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LOGO_TYPES } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'frontend-logo-title',
	templateUrl: './logo-title.component.html',
	styleUrls: ['./logo-title.component.scss'],
	standalone: true,
	imports: [TranslateModule, CommonModule],
})
export class LogoTitleComponent {
	@Input() title: string;
	@Input() logoType = LOGO_TYPES.CITY_PASSES;
	@Input() isVerticalOrientation = true;
	@Input() logoWidth = '64px';
	@Input() logoHeight = 'auto';
}
