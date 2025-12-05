import { Component, Input } from '@angular/core';

@Component({
	selector: 'frontend-info-widget',
	templateUrl: './info-widget.component.html',
	styleUrls: ['./info-widget.component.scss'],
})
export class InfoWidgetComponent {
	@Input() title: string;
	@Input() value: string | number;
	@Input() icon: string;
}
