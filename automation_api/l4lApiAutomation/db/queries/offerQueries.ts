import { DataBase } from '../dbConnection';
import { Grant } from '../../apiModels/grantModels';
import * as offer from '../../apiModels/offerModels';
import { TimeInterval } from '../../utils/timeInterval.enum';
import { WorkingHour } from '../../apiModels/supplierProfileModels';
import { ConvertHelper } from '../../utils/convertHelper';

export async function getOffers(
	isTenant = false,
	isOrderByTitle = false,
	areValid = false,
	offerType?: number
): Promise<offer.OfferResponse[]> {
	const offerQuery = `
    SELECT
        o.id,
        title,
        amount,
        CASE WHEN citizen_offer_type = 'CITIZEN_WITH_PASS' THEN 'offer.citizenWithPass'
        END as "citizenOfferType", 
        ot.offer_type_label as "offerType",
        o.status,
        supplier_id as "supplierId",
        TO_CHAR(start_date, 'YYYY-MM-DD') as "startDate",
        TO_CHAR(expiration_date, 'YYYY-MM-DD') as "expirationDate",
        company_name as "supplierName",
        description,
		CONCAT(TO_CHAR(start_date, 'DD/MM/YYYY'), ' - ', TO_CHAR(expiration_date, 'DD/MM/YYYY')) as "validity"
    FROM l4l_global.offers as o
    INNER JOIN l4l_global.offer_type as ot ON ot.offer_type_id = o.offer_type_id
    INNER JOIN l4l_security.suppliers as s ON o.supplier_id=s.id 
    WHERE
    ${isTenant ? "tenant_id= $1 AND (o.status = 'PENDING' OR o.status = 'REJECTED')" : 'supplier_id= $1'}
    ${offerType ? `AND o.offer_type_id = ${offerType}` : ''}
    ${areValid ? "AND o.status = 'ACTIVE'" : ''}
    ${isOrderByTitle ? 'ORDER BY o.title ASC' : ''}
    `;

	const grantQuery = `
    SELECT 
	  g.id, 
      title, 
      description, 
      amount, 
      create_for AS "createFor",
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
      TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate"
    FROM l4l_global.offer_grants as og
    INNER JOIN l4l_global.grants as g ON og.grant_id=g.id
    WHERE og.offer_id=$1
    `;

	const idParam = isTenant ? process.env.TENANT_ID : process.env.SUPPLIER_ID;

	let offers: offer.OfferResponse[] = await DataBase.executeQuery(offerQuery, [idParam]);

    ConvertHelper.convertValueToNumber(offers, 'amount');

	for (const offer of offers) {
		const grants: Grant[] = await DataBase.executeQuery(grantQuery, [offer.id]);
		ConvertHelper.convertValueToNumber(grants, 'amount');
		offer.grants = grants;
	}

	return offers;
}

export async function getOfferTypes(): Promise<offer.OfferType[]> {
	const query = `
    SELECT 
        offer_type_id AS "offerTypeId",
        offer_type_label AS "offerTypeLabel"
    FROM l4l_global.offer_type`;
	return DataBase.executeQuery<offer.OfferType>(query);
}

export async function getOffersCountByTimePeriod(timeInterval: TimeInterval): Promise<offer.OfferCountsTimePeriod> {
	const baseQuery = `
        SELECT 
            CAST(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS INT) AS "activeCount",
            CAST(SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) AS INT) AS "expiredCount",
            CAST(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS INT) AS "pendingCount"
        FROM 
            l4l_global.offers
        WHERE 
            supplier_id = $1
    `;

	let condition = '';

	switch (timeInterval) {
		case TimeInterval.MONTHLY:
			condition = `
                AND EXTRACT(YEAR FROM created_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM created_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            `;
			break;
		case TimeInterval.QUARTERLY:
			condition = `
                AND created_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
                AND created_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
            `;
			break;
		case TimeInterval.YEARLY:
			condition = `
                AND EXTRACT(YEAR FROM created_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            `;
			break;
		default:
			throw new Error(`Unsupported time interval: ${timeInterval}`);
	}

	const finalQuery = baseQuery + condition;
	return (await DataBase.executeQuery<offer.OfferCountsTimePeriod>(finalQuery, [process.env.SUPPLIER_ID]))[0];
}

export async function getRejectedOfferById(id: string): Promise<offer.OfferReject> {
	const query = `
    SELECT 
        offer_id as "offerId",
        title as "offerTitle",
        reason
    FROM l4l_global.offer_rejection as r
    INNER JOIN l4l_global.offers as o ON r.offer_id=o.id
    WHERE offer_id = $1
    `;
	return (await DataBase.executeQuery<offer.OfferReject>(query, [id]))[0];
}

export async function getOfferFullDetails(id: string): Promise<offer.OfferFull> {
	const query = `
    SELECT
        id,
        title,
        description,
        amount,
        citizen_offer_type AS "citizenOfferType", 
        offer_type_id as "offerTypeId",
        TO_CHAR(start_date, 'YYYY-MM-DD') as "startDate",
        TO_CHAR(expiration_date, 'YYYY-MM-DD') as "expirationDate"
    FROM l4l_global.offers
    WHERE id = $1
    `;

	const grantQuery = `
    SELECT 
      g.id, 
      title, 
      description, 
      amount, 
      create_for AS "createFor",
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
      TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate"
    FROM l4l_global.offer_grants as og
    INNER JOIN l4l_global.grants as g ON og.grant_id=g.id
    WHERE og.offer_id=$1
    `;

	const restrictionQuery = `
    SELECT 
        r.id,
        age_restriction AS "ageRestriction",
        frequency_of_use AS "frequencyOfUse",
        min_price AS "minPrice",
        max_price AS "maxPrice",
        time_from AS "timeFrom",
        time_to AS "timeTo"       
    FROM l4l_global.restrictions as r
    INNER JOIN l4l_global.offers as o ON o.restriction_id=r.id
    WHERE o.id=$1
    `;

	const offer: offer.OfferFull = (await DataBase.executeQuery<offer.OfferFull>(query, [id]))[0];
	offer.amount = Number(offer.amount);
	const grants: Grant[] = await DataBase.executeQuery(grantQuery, [id]);
    ConvertHelper.convertValueToNumber(grants, 'amount');
	const restriction: offer.Restriction = (await DataBase.executeQuery<offer.Restriction>(restrictionQuery, [id]))[0];
	offer.grants = grants;
	offer.restrictionRequestDto = restriction;

	return offer;
}

export async function getOfferDetails(id: string): Promise<offer.OfferDetails> {
	const queryOffer = `
    SELECT 
        o.id,
        o.title,
        o.description,
        o.amount,
        o.citizen_offer_type AS "citizenOfferType",
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate",
        CAST(sp.coordinates_string AS VARCHAR) AS "coordinatesString",
        o.status,
        s.company_name AS "companyName",
        sp.company_address AS "companyAddress",
        pdc.category_label AS "companyCategory",
        sp.logo AS "companyLogo",
        o.is_active as "isActive",
        dc.code as "discountCode"
    FROM l4l_global.offers as o
    INNER JOIN l4l_security.suppliers AS s ON o.supplier_id = s.id
    INNER JOIN l4l_security.supplier_profile AS sp ON s.profile_id=sp.id
    INNER JOIN l4l_global.profile_dropdowns_categories AS pdc ON sp.category_id = pdc.id
    INNER JOIN l4l_global.discount_code AS dc ON dc.offer_id=o.id
    INNER JOIN l4l_security.user as u ON dc.user_id=u.id
    WHERE o.id=$1 and u.id=$2 and o.status='ACTIVE'
    `;

	const queryOfferType = `
    SELECT 
        ot.offer_type_id AS "offerTypeId",
        ot.offer_type_label AS "offerTypeLabel"
    FROM l4l_global.offer_type as ot
    INNER JOIN l4l_global.offers AS o ON ot.offer_type_id = o.offer_type_id
    WHERE o.id=$1
    `;

	const restrictionQuery = `
    SELECT 
        r.id,
        age_restriction AS "ageRestriction",
        frequency_of_use AS "frequencyOfUse",
        min_price AS "minPrice",
        max_price AS "maxPrice",
        time_from AS "timeFrom",
        time_to AS "timeTo"       
    FROM l4l_global.restrictions as r
    INNER JOIN l4l_global.offers as o ON o.restriction_id=r.id
    WHERE o.id=$1
    `;

	const grantsQuery = `
    SELECT 
      g.id, 
      title, 
      description, 
      amount, 
      create_for AS "createFor",
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
      TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate"
    FROM l4l_global.offer_grants as og
    INNER JOIN l4l_global.grants as g ON og.grant_id=g.id
    WHERE og.offer_id=$1`;

	const workingHoursQuery = `
    SELECT 
        wh.id,
        wh.day,
        wh.open_time AS "openTime",
        wh.close_time AS "closeTime",
        wh.is_checked AS "isChecked"
    FROM l4l_global.working_hours AS wh
    INNER JOIN l4l_security.suppliers AS s ON s.id=wh.supplier_id
    INNER JOIN l4l_global.offers AS o ON o.supplier_id=s.id
    WHERE o.id=$1`;

	const offer: offer.OfferDetails = (await DataBase.executeQuery<offer.OfferDetails>(queryOffer, [id, process.env.USER_CITIZEN_ID]))[0];
    if (offer.amount != null) {
        offer.amount = Number(offer.amount);
    }
	const offerType: offer.OfferType = (await DataBase.executeQuery<offer.OfferType>(queryOfferType, [id]))[0];
	const restriction: (offer.Restriction & { id: string })[] = await DataBase.executeQuery<
		offer.Restriction & { id: string }
	>(restrictionQuery, [id]);
	const grants: Grant[] = await DataBase.executeQuery(grantsQuery, [id]);
    ConvertHelper.convertValueToNumber(grants, 'amount');
	const workingHours: WorkingHour[] = await DataBase.executeQuery(workingHoursQuery, [id]);

	offer.offerType = offerType;
	offer.restrictions = restriction[0];
	offer.grants = grants;
	offer.workingHours = workingHours;

	return offer;
}

export async function deleteOfferById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.offers
    WHERE id = $1
    `;
	await DataBase.executeQuery(query, [id]);
}

export async function getOfferWithGrantIds(id: string): Promise<offer.OfferRequest> {
	const query = `
    SELECT
        id,
        title,
        description,
        amount,
        citizen_offer_type AS "citizenOfferType", 
        offer_type_id as "offerTypeId",
        TO_CHAR(start_date, 'YYYY-MM-DD') as "startDate",
        TO_CHAR(expiration_date, 'YYYY-MM-DD') as "expirationDate"
    FROM l4l_global.offers
    WHERE id = $1
    `;

	const grantIdsQuery = `
    SELECT 
        g.id
    FROM l4l_global.offer_grants as og
    INNER JOIN l4l_global.grants as g ON og.grant_id=g.id
    WHERE og.offer_id=$1
    `;

	const restrictionQuery = `
    SELECT 
        r.id,
        age_restriction AS "ageRestriction",
        frequency_of_use AS "frequencyOfUse",
        min_price AS "minPrice",
        max_price AS "maxPrice",
        time_from AS "timeFrom",
        time_to AS "timeTo"       
    FROM l4l_global.restrictions as r
    INNER JOIN l4l_global.offers as o ON o.restriction_id=r.id
    WHERE o.id=$1
    `;

	const offer: offer.OfferRequest = (await DataBase.executeQuery<offer.OfferRequest>(query, [id]))[0];

    if (offer.amount != null) {
        offer.amount = Number(offer.amount);
    }
	const grantIds: { id: string }[] = await DataBase.executeQuery(grantIdsQuery, [id]);
	const restriction: (offer.Restriction & { id: string })[] = await DataBase.executeQuery<
		offer.Restriction & { id: string }
	>(restrictionQuery, [id]);
	offer.grantsIds = grantIds.map((g) => g.id);
	offer.restrictionRequestDto = restriction[0];
	return offer;
}

export async function getOfferRejectionDetails(offerId: string): Promise<offer.OfferReject> {
	const query = `
    SELECT 
        offer_id AS "offerId",
        reason
    FROM l4l_global.offer_rejection
    WHERE offer_id = $1
    `;
	return (await DataBase.executeQuery<offer.OfferReject>(query, [offerId]))[0];
}

export async function deleteOfferRejectionByOfferId(offerId: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.offer_rejection
    WHERE offer_id = $1
    `;
	await DataBase.executeQuery(query, [offerId]);
}

export async function updateOfferToExpired(offerId: string): Promise<void> {
	const query = `
    UPDATE l4l_global.offers
    SET
    expiration_date = '2024-07-31 00:00:00',
    status = 'EXPIRED'
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [offerId]);
}

export async function getOfferIsActive(offerId: string): Promise<boolean> {
	const query = `
    SELECT is_active
    FROM l4l_global.offers
    WHERE id = $1
  `;
	const result = await DataBase.executeQuery<{ is_active: boolean }>(query, [offerId]);
	return result.length > 0 ? result[0].is_active : false;
}
