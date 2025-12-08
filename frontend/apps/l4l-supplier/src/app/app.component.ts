import { Component } from '@angular/core';
import { Role } from '@frontend/common';
import { GenericAppComponent } from '@frontend/common-ui';

@Component({
	selector: 'frontend-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: false,
})
export class AppComponent extends GenericAppComponent {
	public get isCashierRole(): boolean {
		return this.authService.userRole?.name === Role.CASHIER;
	}
}
