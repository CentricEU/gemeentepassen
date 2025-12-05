import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { WindmillModule } from '../../windmil.module';
import { InfoWidgetComponent } from './info-widget.component';

describe('InfoWidgetComponent', () => {
	let component: InfoWidgetComponent;
	let fixture: ComponentFixture<InfoWidgetComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [InfoWidgetComponent],
			imports: [TranslateModule.forRoot(), WindmillModule],
		}).compileComponents();

		fixture = TestBed.createComponent(InfoWidgetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
