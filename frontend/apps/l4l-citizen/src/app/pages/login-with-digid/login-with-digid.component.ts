import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CommonL4LModule, commonRoutingConstants } from '@frontend/common';
import { LogoTitleComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { createSignicatAuthConfig } from '../../config/signicat.config';
import { OauthSpecService } from '../../services/oauth-service/oauth.service';
import { BaseOAuthComponent } from '../../shared/directives/base-oauth/base-oauth.component';

@Component({
	selector: 'app-login-with-digid',
	standalone: true,
	imports: [CommonModule, CommonL4LModule, WindmillModule, LogoTitleComponent, TranslateModule],
	templateUrl: './login-with-digid.component.html',
	styleUrl: './login-with-digid.component.scss',
})
export class LoginWithDigiDComponent extends BaseOAuthComponent {
	protected override readonly oauthService = inject(OauthSpecService);
	protected override get defaultRedirectUrl(): string {
		return '/';
	}

	constructor() {
		super();
		this.oauthService.configure(createSignicatAuthConfig(commonRoutingConstants.login));
	}

}
