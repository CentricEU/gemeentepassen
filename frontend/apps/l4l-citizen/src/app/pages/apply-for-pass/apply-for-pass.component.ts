import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonL4LModule, commonRoutingConstants } from '@frontend/common';
import { LogoTitleComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { createSignicatAuthConfig } from '../../config/signicat.config';
import { OauthSpecService } from '../../services/oauth-service/oauth.service';
import { BaseOAuthComponent } from '../../shared/directives/base-oauth/base-oauth.component';

@Component({
	selector: 'app-apply-for-pass',
	imports: [CommonModule, CommonL4LModule, WindmillModule, LogoTitleComponent, TranslateModule],
	templateUrl: './apply-for-pass.component.html',
	styleUrl: './apply-for-pass.component.scss',
})
export class ApplyForPassComponent extends BaseOAuthComponent {
	protected override get defaultRedirectUrl(): string {
		return commonRoutingConstants.digidCategory;
	}

	constructor(protected override oauthService: OauthSpecService) {
		super();
		this.oauthService.configure(createSignicatAuthConfig(commonRoutingConstants.applyForPass));
	}
}
