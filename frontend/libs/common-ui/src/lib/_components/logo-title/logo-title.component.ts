import { Component, Input } from '@angular/core';

@Component({
	selector: 'frontend-logo-title',
	templateUrl: './logo-title.component.html',
	styleUrls: ['./logo-title.component.scss'],
})
export class LogoTitleComponent {
	@Input() title: string;
}
