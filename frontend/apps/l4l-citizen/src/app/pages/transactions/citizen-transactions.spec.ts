import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitizenTransactionsComponent } from './citizen-transactions';

describe('CitizenTransactionsComponent', () => {
	let component: CitizenTransactionsComponent;
	let fixture: ComponentFixture<CitizenTransactionsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CitizenTransactionsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(CitizenTransactionsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
