import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	AuthService,
	Breadcrumb,
	BreadcrumbService,
	commonRoutingConstants,
	SupplierRejectionService,
} from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SupplierService } from '../../services/supplier-service/supplier.service';
import { SupplierEditComponent } from './supplier-edit.component';

describe('SupplierEditComponent', () => {
	let component: SupplierEditComponent;
	let fixture: ComponentFixture<SupplierEditComponent>;
	let supplierServiceSpy: any;
	let supplierRejectionServiceSpy: any;
	let authServiceSpy: any;

	const breadcrumbServiceSpy = {
		setBreadcrumbs: jest.fn(),
		removeBreadcrumbs: jest.fn(),
	};
	beforeEach(async () => {
		supplierServiceSpy = {
			getSupplierById: jest.fn().mockReturnValue(of({ status: 'REJECTED' })),
		};

		supplierRejectionServiceSpy = {
			getSupplierRejectionInformation: jest.fn(),
			getRejectionReasonLabel: jest.fn().mockReturnValue('Some reason'),
		};

		authServiceSpy = {
			extractSupplierInformation: jest.fn().mockReturnValue('supplier-123'),
		};

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [SupplierEditComponent],
			imports: [TranslateModule.forRoot()],
			providers: [
				{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
				{ provide: SupplierService, useValue: supplierServiceSpy },
				{ provide: SupplierRejectionService, useValue: supplierRejectionServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: 'env', useValue: {} },
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize breadcrumbs on ngOnInit', () => {
		component.ngOnInit();
		expect(breadcrumbServiceSpy.setBreadcrumbs).toHaveBeenCalledWith([
			new Breadcrumb('general.pages.dashboard', ['']),
			new Breadcrumb('general.pages.editProfile', [commonRoutingConstants.editProfile]),
		]);
	});

	describe('initSupplierInformation', () => {
		it('should set shouldDisplayWarningMessage to true if supplier is rejected', () => {
			const supplier = { status: 'REJECTED' };
			const rejectionInfo = { reason: 'reason', comments: 'comments' };
			supplierServiceSpy.getSupplierById.mockReturnValue({ subscribe: (cb: any) => cb(supplier) });
			supplierRejectionServiceSpy.getSupplierRejectionInformation.mockReturnValue({
				subscribe: (cb: any) => cb(rejectionInfo),
			});

			// Mock forkJoin to call subscribe with expected values
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			jest.spyOn(require('rxjs'), 'forkJoin').mockReturnValue({
				subscribe: (fn: any) => fn({ supplier, rejectionInfo }),
			} as any);

			component['supplierId'] = 'supplier-123';
			component['initSupplierInformation']();

			expect(component.isRejectedStatus).toBe(true);
			expect((component as any).supplierRejectionInformation).toEqual(rejectionInfo);
		});
	});

	describe('rejectionDetailsList', () => {
		it('should return correct labels and values when supplierRejectionInformation is set', () => {
			(component as any).supplierRejectionInformation = {
				reason: 'Some reason',
				comments: 'Some comments',
			};
			const details = component.rejectionDetailsList;
			expect(details).toEqual([
				{
					label: 'rejectSupplier.reasonPlaceholder',
					value: 'Some reason',
				},
				{
					label: 'rejectSupplier.commentPlaceholder',
					value: 'Some comments',
				},
			]);
		});

		it('should return "-" for comments if comments is undefined', () => {
			(component as any).supplierRejectionInformation = {
				reason: 'Another reason',
				comments: undefined,
			};
			const details = component.rejectionDetailsList;
			expect(details).toEqual([
				{
					label: 'rejectSupplier.reasonPlaceholder',
					value: 'Another reason',
				},
				{
					label: 'rejectSupplier.commentPlaceholder',
					value: '-',
				},
			]);
		});

		it('should return undefined values if supplierRejectionInformation is not set', () => {
			(component as any).supplierRejectionInformation = undefined;
			const details = component.rejectionDetailsList;
			expect(details).toEqual([
				{
					label: 'rejectSupplier.reasonPlaceholder',
					value: undefined,
				},
				{
					label: 'rejectSupplier.commentPlaceholder',
					value: '-',
				},
			]);
		});
	});
});
