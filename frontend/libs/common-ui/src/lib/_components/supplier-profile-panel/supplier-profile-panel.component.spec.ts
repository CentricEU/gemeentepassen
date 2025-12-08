import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
	AuthService,
	ContactInformation,
	GeneralInformation,
	SupplierProfile,
	SupplierProfileService,
} from '@frontend/common';
import { of } from 'rxjs';

import { CommonUiModule } from '../../common-ui.module';
import { WindmillModule } from '../../windmil.module';
import { SupplierInformationPanelComponent } from './supplier-profile-panel.component';

describe('SupplierInformationPanelComponent', () => {
	let component: SupplierInformationPanelComponent;
	let fixture: ComponentFixture<SupplierInformationPanelComponent>;
	let supplierProfileService: jest.Mocked<SupplierProfileService>;
	let activatedRouteMock: any;
	let authServiceMock: any;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const supplierProfileData: SupplierProfile = {
		companyBranchAddress: 'Address',
		branchProvince: 'Province',
		branchZip: 'Zip',
		branchLocation: 'Location',
		branchTelephone: 'Telephone',
		email: 'email@email.com',
		website: 'Website',
		accountManager: 'Manager',
		companyName: 'Company',
		adminEmail: 'Email',
		kvkNumber: '12345678',
		ownerName: 'Owner',
		legalForm: 'Form',
		group: 'Group',
		category: 'Category',
		subcategory: 'Subcategory',
		supplierId: '123',
	};

	const generalInformationForm: GeneralInformation = {
		logo: '',
		companyName: 'companyName',
		adminEmail: 'admin@gmail.com',
		kvkNumber: '12345678',
		ownerName: 'owner',
		legalForm: '0',
		group: '0',
		category: '0',
		subcategory: '0',
		bic: 'ABNANL2A',
		iban: 'NL91ABNA0417164300',
	};

	const contactInformationForm: ContactInformation = {
		branchProvince: 'branchProvince',
		companyBranchAddress: 'companyBranchAddress',
		branchLocation: 'branchLocation',
		branchZip: '1234ZD',
		branchTelephone: '+31852158217',
		accountManager: 'account',
		email: 'test@gmail.com',
		website: 'website.com',
	};

	beforeEach(async () => {
		supplierProfileService = {
			getSupplierProfile: jest.fn(),
			supplierProfileInformation: supplierProfileData,
		} as unknown as jest.Mocked<SupplierProfileService>;

		activatedRouteMock = {
			paramMap: of({ get: jest.fn() }),
		};

		authServiceMock = {
			extractSupplierInformation: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [SupplierInformationPanelComponent],
			imports: [WindmillModule, CommonUiModule],
			providers: [
				{ provide: SupplierProfileService, useValue: supplierProfileService },
				{ provide: 'env', useValue: environmentMock },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: AuthService, useValue: authServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierInformationPanelComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return null when supplierProfileInfomationComponent is undefined', () => {
		expect(component.decodedImage).toBeFalsy();
	});

	it('should return null when supplierProfileInfomationComponent is undefined', () => {
		component.supplierProfileInfomationComponent = {
			decodedImage: null,
		} as any;

		expect(component.decodedImage).toBeNull();
	});

	it('should return decoded image from supplierProfileInfomationComponent', () => {
		const decodedImageMock = 'mockedDecodedImage';
		component.supplierProfileInfomationComponent = {
			decodedImage: decodedImageMock,
		} as any;

		expect(component.decodedImage).toBe(decodedImageMock);
	});

	it('should return new SupplierProfile when supplierProfileInformation not available', () => {
		expect(component['supplierProfileService'].supplierProfileInformation).toEqual(supplierProfileData);
		expect(component.supplierProfileServiceInformation).toEqual(supplierProfileData);
	});

	it('should call saveChanges method of supplierProfileInfomationComponent', () => {
		component.supplierProfileInfomationComponent = {
			saveChanges: jest.fn(),
		} as any;

		component.saveChanges();
		expect(component.supplierProfileInfomationComponent.saveChanges).toHaveBeenCalled();
	});

	it('should log a message when suspendSupplier is called', () => {
		const consoleSpy = jest.spyOn(console, 'log');
		component.suspendSupplier();
		expect(consoleSpy).toHaveBeenCalledWith('Out of scope for this PIB');
	});

	it('should log a message indicating resetChanges should be implemented', () => {
		const consoleSpy = jest.spyOn(console, 'log');
		component.resetChanges();
		expect(consoleSpy).toHaveBeenCalledWith('Should be implemented');
	});

	describe('Tests for shouldDisableFinishButton ', () => {
		const invalidContactInformationForm = {
			...contactInformationForm,
			companyBranchAddress: null,
		};

		const invalidGeneralInformationForm = {
			...generalInformationForm,
			kvkNumber: null,
		};
		it('should return true if both forms are invalid', () => {
			component.supplierProfileInfomationComponent?.contactInformationForm?.setValue(
				invalidContactInformationForm,
			);
			component.supplierProfileInfomationComponent?.generalInformationForm?.setValue(
				invalidGeneralInformationForm,
			);

			expect(component.shouldDisableFinishButton()).toBe(true);
		});

		it('should return true if contact form is invalid and general form is valid', () => {
			component.supplierProfileInfomationComponent?.contactInformationForm?.setValue(
				invalidContactInformationForm,
			);
			component.supplierProfileInfomationComponent?.generalInformationForm?.setValue(generalInformationForm);
			expect(component.shouldDisableFinishButton()).toBe(true);
		});

		it('should return true if contact form is valid and general form is invalid', () => {
			component.supplierProfileInfomationComponent?.contactInformationForm?.setValue(contactInformationForm);
			component.supplierProfileInfomationComponent?.generalInformationForm?.setValue(
				invalidGeneralInformationForm,
			);
			expect(component.shouldDisableFinishButton()).toBe(true);
		});
	});

	describe('actionButtonText', () => {
		it('should return "general.button.reapply" when isRejectedStatus is true', () => {
			component.isRejectedStatus = true;
			expect(component.actionButtonText).toBe('general.button.reapply');
		});

		it('should return "general.button.saveChanges" when isRejectedStatus is false', () => {
			component.isRejectedStatus = false;
			expect(component.actionButtonText).toBe('general.button.saveChanges');
		});
	});
});
