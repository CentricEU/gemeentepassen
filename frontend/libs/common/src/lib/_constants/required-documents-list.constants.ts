import { RequiredDocuments } from '../_enums/required-documents.enum';

export const REQUIRED_DOCUMENTS_LIST: {
	formControl: string;
	translateKey: string;
	value: string;
	id: string;
	dataTestId: string;
}[] = [
	{
		formControl: 'formControlProofOfIdentity',
		translateKey: 'proofOfIdentity',
		value: RequiredDocuments.PROOF_OF_IDENTITY,
		id: 'id-proof-of-identity',
		dataTestId: 'data-testid-proof-of-identity',
	},
	{
		formControl: 'formControlIncomeProof',
		translateKey: 'incomeProof',
		value: RequiredDocuments.INCOME_PROOF,
		id: 'id-income-proof',
		dataTestId: 'data-testid-income-proof',
	},
	{
		formControl: 'formControlAssets',
		translateKey: 'assets',
		value: RequiredDocuments.ASSETS,
		id: 'id-assets',
		dataTestId: 'data-testid-assets',
	},
	{
		formControl: 'formControlDebtsOrAlimony',
		translateKey: 'debtsOrAlimony',
		value: RequiredDocuments.DEBTS_OR_ALIMONY_OBLIGATIONS,
		id: 'id-debts-or-alimony',
		dataTestId: 'data-testid-debts-or-alimony',
	},
];
