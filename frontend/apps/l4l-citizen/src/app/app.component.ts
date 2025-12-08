import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppType } from '@frontend/common';
import { GenericAppComponent } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	standalone: true,
	imports: [RouterModule, TranslateModule],
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent extends GenericAppComponent {
	public override applicationType = AppType.citizen;
}
