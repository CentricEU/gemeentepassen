import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService, NavigationService } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { OauthSpecService } from '../../services/oauth-service/oauth.service';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [CommonModule, TranslateModule, WindmillModule],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
	private readonly authService = inject(AuthService);
	private readonly oauthService = inject(OauthSpecService);
	private readonly navigationService = inject(NavigationService);

	public logout(): void {
		this.authService.logout();
		this.oauthService.logout();
		this.navigationService.reloadCurrentRoute();
	}
}
