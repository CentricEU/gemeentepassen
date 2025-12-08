import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PriceRangeComponent } from './price-range.component';

describe('PriceRangeComponent', () => {
	let component: PriceRangeComponent;
	let fixture: ComponentFixture<PriceRangeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PriceRangeComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot()],
			providers: [],
		}).compileComponents();

		fixture = TestBed.createComponent(PriceRangeComponent);
		component = fixture.componentInstance;

		component.createOfferForm = new FormGroup({
			minPrice: new FormControl(0),
			maxPrice: new FormControl(''),
		});

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
