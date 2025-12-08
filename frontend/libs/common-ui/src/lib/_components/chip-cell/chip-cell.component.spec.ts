import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { WindmillModule } from '../../windmil.module';
import { NoDataComponent } from '../no-data/no-data.component';
import { ChipCellComponent } from './chip-cell.component';

describe('ChipCellComponent', () => {
	let component: ChipCellComponent<NoDataComponent>;
	let fixture: ComponentFixture<ChipCellComponent<NoDataComponent>>;
	let dialogService: DialogService;

	beforeEach(async () => {
		const dialogServiceMock = {
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
		};

		await TestBed.configureTestingModule({
			declarations: [ChipCellComponent],
			imports: [WindmillModule, TranslateModule.forRoot()],
			providers: [{ provide: DialogService, useValue: dialogServiceMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(ChipCellComponent<NoDataComponent>);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);
		component.row = { chips: ['chip1', 'chip2', 'chip3'] };
		component.columnWithChips = 'chips';
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize properly in ngOnInit', () => {
		component.ngOnInit();
		expect(component.remainingChips).toBeLessThan(0);
	});

});
