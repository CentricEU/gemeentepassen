import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CitizenGroupAge } from '../../_enums/citizen-group-age.enum';
import { EligibilityCriteria } from '../../_enums/eligibility-criteria.enum';
import { RequiredDocuments } from '../../_enums/required-documents.enum';
import { CitizenGroupDto } from '../../_models/citizen-group-dto.model';
import { CitizenGroupsService } from './citizen-groups.service';
import { commonRoutingConstants } from '../../_constants/common-routing.constants';

describe('CitizenGroupsService', () => {
	let service: CitizenGroupsService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [CitizenGroupsService, { provide: 'env', useValue: environmentMock }],
		});

		httpMock = TestBed.inject(HttpTestingController);
		service = TestBed.inject(CitizenGroupsService);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get citizenGroups count', () => {
		const mockResponse = 10;

		service.countCitizenGroups().subscribe((count) => {
			expect(count).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups/count`);
		expect(req.request.method).toBe('GET');
		req.flush(mockResponse);
	});

	it('should get citizenGroups list paginated', () => {
		const pageIndex = 1;
		const perPage = 10;

		const dummyCitizenGroups = [
			{
				id: '1',
				groupName: 'Families',
				ageGroup: '26-45',
				dependentChildrenIncluded: true,
				thresholdAmount: 40,
				maxIncome: 40000,
			},
			{
				id: '2',
				groupName: 'Seniors',
				ageGroup: '65+',
				dependentChildrenIncluded: false,
				thresholdAmount: 20,
				maxIncome: 15000,
			},
		];

		service.getCitizenGroupsPaginated(pageIndex, perPage).subscribe((groups) => {
			expect(groups).toEqual(dummyCitizenGroups);
		});

		const req = httpMock.expectOne(
			(r) =>
				r.url === `${environmentMock.apiPath}/citizen-groups/paginated` &&
				r.params.get('page') === pageIndex.toString() &&
				r.params.get('size') === perPage.toString(),
		);

		expect(req.request.method).toBe('GET');
		req.flush(dummyCitizenGroups);
	});

	it('should get all citizenGroups', () => {
		const dummyCitizenGroups = [
			{
				id: '1',
				groupName: 'Families',
				ageGroup: '26-45',
				dependentChildrenIncluded: true,
				thresholdAmount: 40,
				maxIncome: 40000,
			},
			{
				id: '2',
				groupName: 'Seniors',
				ageGroup: '65+',
				dependentChildrenIncluded: false,
				thresholdAmount: 20,
				maxIncome: 15000,
			},
		];

		service.getCitizenGroups().subscribe((groups) => {
			expect(groups).toEqual(dummyCitizenGroups);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups`);
		expect(req.request.method).toBe('GET');
		req.flush(dummyCitizenGroups);
	});

	it('should send a POST request to save a citizen group', () => {
		const mockCitizenGroupDto: CitizenGroupDto = {
			groupName: 'Test Group',
			ageGroup: [CitizenGroupAge.UNDER_18],
			isDependentChildrenIncluded: false,
			thresholdAmount: 10,
			maxIncome: 0,
			eligibilityCriteria: [EligibilityCriteria.HAS_EXISTING_DIGID],
			requiredDocuments: [RequiredDocuments.DEBTS_OR_ALIMONY_OBLIGATIONS],
		};

		service.saveCitizenGroup(mockCitizenGroupDto).subscribe((response) => {
			expect(response).toBeDefined();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(mockCitizenGroupDto);

		req.flush({});
	});

	it('should send a POST request to send a message for none category fit', () => {
		const testMessage = 'No suitable category found';

		service.sendMessageForNoneCategoryFit(testMessage).subscribe((response) => {
			expect(response).toBeUndefined();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups/none-category-fit`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({ message: testMessage });

		req.flush({});
	});

	it('should send a POST request to assign a citizen group to a citizen', () => {
		const categoryId = 'test-category-id';

		service.assignCitizenGroupToCitizen(categoryId).subscribe((response) => {
			expect(response).toBeUndefined();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups/assignment?categoryId=${categoryId}`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({});

		req.flush({});
	});

	it('should get all required documents', () => {
		const mockDocuments: RequiredDocuments[] = [
			RequiredDocuments.DEBTS_OR_ALIMONY_OBLIGATIONS,
			RequiredDocuments.INCOME_PROOF,
		];

		service.getAllRequiredDocuments().subscribe((documents) => {
			expect(documents).toEqual(mockDocuments);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups//documents`);
		expect(req.request.method).toBe('GET');

		req.flush(mockDocuments);
	});

	it('should handle errors when getAllRequiredDocuments fails', () => {
		let errorResponse: any;

		service.getAllRequiredDocuments().subscribe({
			next: (documents) => {
				/* handle documents */
			},
			error: (err) => (errorResponse = err),
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups//documents`);
		req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(500);
		expect(errorResponse.statusText).toBe('Internal Server Error');
	});

	it('should get all required documents for citizen group', () => {
		const mockDocuments: RequiredDocuments[] = [
			RequiredDocuments.DEBTS_OR_ALIMONY_OBLIGATIONS,
			RequiredDocuments.INCOME_PROOF,
		];

		service.getRequiredDocumentsForCitizenGroup().subscribe((documents) => {
			expect(documents).toEqual(mockDocuments);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups/documents`);
		expect(req.request.method).toBe('GET');

		req.flush(mockDocuments);
	});

	it('should handle errors when getRequiredDocumentsForCitizenGroup fails', () => {
		let errorResponse: any;

		service.getRequiredDocumentsForCitizenGroup().subscribe({
			next: (documents) => {
				/* handle documents */
			},
			error: (err) => (errorResponse = err),
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/citizen-groups/documents`);
		req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(500);
		expect(errorResponse.statusText).toBe('Internal Server Error');
	});

	describe('startFlowPageValue getter and setter', () => {
		it('should set and get startFlowPageValue correctly', () => {
			expect(service.startFlowPageValue).toBe(commonRoutingConstants.digidCategory);

			service.startFlowPageValue = '/digid-category';
			expect(service.startFlowPageValue).toBe('/digid-category');

			service.startFlowPageValue = commonRoutingConstants.digidCategory;
			expect(service.startFlowPageValue).toBe(commonRoutingConstants.digidCategory);
		});
	});
});
