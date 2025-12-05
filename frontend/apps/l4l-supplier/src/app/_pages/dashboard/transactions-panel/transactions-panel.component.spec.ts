import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { AppModule } from '../../../app.module';
import { TransactionsPanelComponent } from './transactions-panel.component';

describe('TransactionsPanelComponent', () => {
	let component: TransactionsPanelComponent;
	let fixture: ComponentFixture<TransactionsPanelComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TransactionsPanelComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
		}).compileComponents();

		fixture = TestBed.createComponent(TransactionsPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
