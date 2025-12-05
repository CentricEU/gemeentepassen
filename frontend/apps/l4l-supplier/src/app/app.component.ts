import { Component } from '@angular/core';
import { GenericAppComponent } from '@frontend/common-ui';

@Component({
	selector: 'frontend-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent extends GenericAppComponent {}
