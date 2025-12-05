import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
	AuthService,
	Breadcrumb,
	BreadcrumbService,
	commonRoutingConstants,
	FILE_SIZE_THRESHOLD,
	GeneralInformation,
	PdokService,
	PdokUtil,
	SupplierCoordinates,
	SupplierProfile,
	SupplierProfileDto,
	SupplierProfileService,
	UserInfo,
} from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@windmill/ng-windmill';
import { of, switchMap, tap } from 'rxjs';

@Component({
	selector: 'frontend-supplier-profile',
	templateUrl: './supplier-profile.component.html',
	styleUrls: ['./supplier-profile.component.scss'],
})
export class SupplierProfileComponent implements OnInit, OnDestroy {
	@ViewChild('fileUpload') fileUpload: ElementRef;

	@Input() isReadOnly = false;

	public supplierId: string | null;
	public decodedImage: string | ArrayBuffer | null;

	public isGenericState = false;
	public isSizeExceeded = false;

	public contactInformationForm: FormGroup = new FormGroup([]);
	public initialContactInformationForm: FormGroup;
	public generalInformationForm: FormGroup = new FormGroup([]);
	public initialGeneralInformationForm: FormGroup;

	public isToggleActive = false;

	private shouldUpdateBreadcrumbs = false;

	public get areFormValuesChanged(): boolean {
		return (
			!this.isReadOnly &&
			(JSON.stringify(this.initialContactInformationForm) !== JSON.stringify(this.contactInformationForm.value) ||
				JSON.stringify(this.initialGeneralInformationForm) !==
					JSON.stringify(this.generalInformationForm.value))
		);
	}

	public get supplierProfileServiceInformation(): SupplierProfile {
		const profileValue = this.supplierProfileService.supplierProfileInformation;

		return profileValue ? profileValue : new SupplierProfile();
	}

	public get extractSupplierInformation(): string {
		return this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
	}

	constructor(
		private readonly toastrService: ToastrService,
		private translateService: TranslateService,
		private breadcrumbService: BreadcrumbService,
		private route: ActivatedRoute,
		private supplierProfileService: SupplierProfileService,
		private pdokService: PdokService,
		private authService: AuthService,
	) {}

	public ngOnInit(): void {
		this.initSupplierProfile();
	}

	public ngOnDestroy(): void {
		this.removeBreadcrumbs();
	}

	public openFileInput(): void {
		this.fileUpload?.nativeElement.click();
	}

	public suspendSupplier(): void {
		console.log('Out of scope for this PIB');
	}

	public resetChanges(): void {
		console.log('Should be implemented');
	}

	public saveChanges(): void {
		const toastText = this.translateService.instant('general.success.changesSavedText');
		const supplierProfileDto = this.mapSupplierProfile();

		this.updateSupplierProfile(supplierProfileDto, toastText);
	}

	private updateSupplierProfile(supplierProfileDto: SupplierProfileDto, toastText: string): void {
		this.pdokService
			.getCoordinateFromAddress(supplierProfileDto.branchLocation, supplierProfileDto.branchZip)
			.pipe(
				switchMap((data) => {
					if (!data.response.numFound) {
						this.displayErrorToaster();
						return of(null);
					}

					const coordinates: SupplierCoordinates = PdokUtil.getCoordinatesFromPdok(data);
					supplierProfileDto.latlon = coordinates;

					return this.supplierProfileService.updateSupplierProfile(supplierProfileDto).pipe(
						tap(() => {
							this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
							this.initialContactInformationForm = structuredClone(this.contactInformationForm.value);
							this.initialGeneralInformationForm = structuredClone(this.generalInformationForm.value);
						}),
					);
				}),
			)
			.subscribe((result) => {
				if (!result) {
					return;
				}

				this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
			});
	}

	public handleInformationFormEvent(data: FormGroup, isContactInformationForm: boolean): void {
		const formType = isContactInformationForm ? 'contactInformationForm' : 'generalInformationForm';
		const initialFormType = isContactInformationForm
			? 'initialContactInformationForm'
			: 'initialGeneralInformationForm';

		if (!this[initialFormType] && JSON.stringify(data.value) !== JSON.stringify({})) {
			this[initialFormType] = structuredClone(data.value);
		}

		this[formType] = data;
	}

	public fileInputClick(event: Event): void {
		const element = event.target as HTMLInputElement;
		element.value = '';
	}

	public onFileSelected(event: Event | any): void {
		this.isGenericState = false;
		this.isSizeExceeded = false;
		const filesSelected = (<HTMLInputElement>event.target).files;

		if (!filesSelected || !filesSelected.length) {
			return;
		}

		const file = filesSelected[0];

		if (file.size > FILE_SIZE_THRESHOLD) {
			this.isSizeExceeded = true;
			return;
		}

		this.convertImageToBase64(file);
	}

	private convertImageToBase64(file: Blob): void {
		const reader = new FileReader();

		reader.onload = (e: any) => {
			const base64Image = e.target.result.split(',')[1];
			this.generalInformationForm.get('logo')?.setValue(base64Image);
			this.decodedImage = reader.result;
		};

		reader.readAsDataURL(file);
	}

	private initSupplierProfile(): void {
		if (this.isReadOnly) {
			this.subscribeToRouteParam();
			return;
		}

		const supplierId = this.authService.extractSupplierInformation(UserInfo.SupplierId);
		if (!supplierId) {
			return;
		}
		this.initSupplier(supplierId);
	}

	private decodeBase64Image(value: string): void {
		const binaryString = atob(value);
		const bytes = new Uint8Array(Array.from(binaryString, (char) => char.charCodeAt(0)));

		const blob = new Blob([bytes], { type: 'image/*' });
		this.createImageFromBlob(blob);
	}

	private createImageFromBlob(blob: Blob) {
		const reader = new FileReader();

		reader.onloadend = () => {
			this.decodedImage = reader.result as string;
		};

		reader.readAsDataURL(blob);
	}

	private subscribeToRouteParam(): void {
		this.route.paramMap.subscribe((params) => {
			this.supplierId = params.get('id');
			if (!this.supplierId) {
				return;
			}
			this.shouldUpdateBreadcrumbs = true;
			this.initSupplier(this.supplierId);
		});
	}

	private initSupplier(supplierId: string): void {
		this.supplierProfileService.getSupplierProfile(supplierId).subscribe((data) => {
			this.addBreadcrumbsForView(data);
			if (!data.logo) {
				this.isGenericState = true;
				return;
			}
			this.decodeBase64Image(data.logo);
		});
	}

	private mapSupplierProfile(): SupplierProfileDto {
		const { legalForm, group, category, subcategory, ...generalInformationFormValue }: GeneralInformation =
			this.generalInformationForm.value;
		const contactInformationFormValue = this.contactInformationForm.value;

		const supplierProfileDto: SupplierProfileDto = {
			...contactInformationFormValue,
			...generalInformationFormValue,
			legalForm: parseInt(legalForm, 10),
			group: parseInt(group, 10),
			category: parseInt(category, 10),
			subcategory: parseInt(subcategory, 10),
			supplierId: this.authService.extractSupplierInformation(UserInfo.SupplierId),
		};

		return supplierProfileDto;
	}

	private addBreadcrumbsForView(supplier: SupplierProfile): void {
		if (!this.shouldUpdateBreadcrumbs) {
			return;
		}

		const routerValue = commonRoutingConstants.supplierDetails.replace(':id', supplier.supplierId as string);
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.suppliers', [commonRoutingConstants.suppliers]),
			new Breadcrumb(supplier.companyName, [routerValue]),
		];

		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}

	private removeBreadcrumbs(): void {
		if (!this.shouldUpdateBreadcrumbs) {
			return;
		}
		this.breadcrumbService.removeBreadcrumbs();
	}

	private displayErrorToaster(): void {
		const toasterMessage = this.translateService.instant(`setupProfile.invalidZipCodeEdit`);

		this.toastrService.error(`<p>${toasterMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}
}
