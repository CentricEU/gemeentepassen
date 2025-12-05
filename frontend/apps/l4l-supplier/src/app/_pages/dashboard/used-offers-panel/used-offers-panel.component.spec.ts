import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { AppModule } from '../../../app.module';
import { UsedOffersPanelComponent } from './used-offers-panel.component';

describe('UsedOffersPanelComponent', () => {
	let component: UsedOffersPanelComponent;
	let fixture: ComponentFixture<UsedOffersPanelComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UsedOffersPanelComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
		}).compileComponents();

		fixture = TestBed.createComponent(UsedOffersPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
