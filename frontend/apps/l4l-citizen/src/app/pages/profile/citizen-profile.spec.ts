import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitizenProfileComponent } from './citizen-profile';

describe('CitizenProfileComponent', () => {
	let component: CitizenProfileComponent;
	let fixture: ComponentFixture<CitizenProfileComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CitizenProfileComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(CitizenProfileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
