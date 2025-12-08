import { DataBase } from '../dbConnection';
import { DiscountCode, DiscountCodeValidationResponse, ResponseDiscountCode } from '../../apiModels/discountCodeModels';
import { OfferType } from '../../apiModels/offerModels';
import { getOfferTypes } from './offerQueries';

export async function deleteDiscountCodeByOfferId(offerId: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.discount_code
    WHERE offer_id = $1
  `;
	await DataBase.executeQuery(query, [offerId]);
}

export async function getDiscountCode(isActive?: boolean, offerId?: string): Promise<DiscountCode[]> {
	let baseQuery = `
    SELECT 
      company_name as "companyName",
      TO_CHAR(o.expiration_date, 'YYYY-MM-DD') as "expirationDate",
      o.offer_type_id as "offerTypeId",
      code,
      o.is_active as "isActive",
      spp.logo as "companyLogo",
      o.amount,
      o.title as "offerTitle"
    FROM l4l_global.discount_code AS dc
    INNER JOIN l4l_global.offers AS o ON dc.offer_id=o.id
    INNER JOIN l4l_security.suppliers AS sp ON sp.id=o.supplier_id
    INNER JOIN l4l_security.supplier_profile AS spp ON sp.profile_id =spp.id
    WHERE dc.user_id=$1
  `;

	if (offerId) {
		baseQuery += ` AND o.id='${offerId}'`;
	}

	if (isActive !== undefined) {
		baseQuery += isActive ? ' AND o.is_active=true' : ' AND o.is_active=false';
	}
	type DiscountCodeWithOfferTypeId = DiscountCode & { offerTypeId: number };

	baseQuery += ' ORDER BY o.expiration_date ASC';
	
	let response: DiscountCodeWithOfferTypeId[] = await DataBase.executeQuery<DiscountCodeWithOfferTypeId>(baseQuery, [
		process.env.USER_CITIZEN_ID
	]);
	const offerTypes: OfferType[] = await getOfferTypes();

	response.forEach((code) => {
		code.amount = Number(code.amount);
		const offerType = offerTypes.find((ot) => ot.offerTypeId === code.offerTypeId);
		code.offerType = offerType;
		delete (code as any).offerTypeId;
	});
	return response;
}

export async function getAllDiscountCodes(): Promise<ResponseDiscountCode> {
	const activeCodes = await getDiscountCode(true);
	const inactiveCodes = await getDiscountCode(false);

	const response: ResponseDiscountCode = {
		active: activeCodes,
		inactive: inactiveCodes
	};

	return response;
}

export async function getDiscountCodeId(code: string): Promise<string[]> {
	const query = `
	SELECT id
	FROM l4l_global.discount_code
	WHERE code=$1
	  `;
	const response = await DataBase.executeQuery<{ id: string }>(query, [code]);
	return response.map((r) => r.id);
}

export async function getValidateDiscountCode(code : string) : Promise<DiscountCodeValidationResponse>{
	const query = `
	SELECT 
		dc.code,
		null as "offerName",
		null as "offerType"
	FROM l4l_global.discount_code AS dc
	INNER JOIN l4l_global.offers AS o ON dc.offer_id = o.id
	WHERE dc.code = $1`;

	const response = await DataBase.executeQuery<DiscountCodeValidationResponse>(query, [code]);
	return response[0];
}
