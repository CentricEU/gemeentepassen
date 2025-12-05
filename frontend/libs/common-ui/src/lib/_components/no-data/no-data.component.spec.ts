import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { NoDataComponent } from './no-data.component';

describe('NoDataComponent', () => {
	let component: NoDataComponent;
	let fixture: ComponentFixture<NoDataComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NoDataComponent],
			imports: [TranslateModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(NoDataComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
