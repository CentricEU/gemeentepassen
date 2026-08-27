//     Will use it until migrate to standalone for Supplier/Municipality.
//     Will be removed afterwards since it's duplicated but the other one it's
//     not standalone and other dependend components will need to be migrated to standalone
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { NoDataComponent } from './no-data.component';

describe('NoDataComponent', () => {
	let component: NoDataComponent;
	let fixture: ComponentFixture<NoDataComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), NoDataComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(NoDataComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
