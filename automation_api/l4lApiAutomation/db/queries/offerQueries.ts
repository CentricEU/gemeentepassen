import { DataBase } from '../dbConnection';
import * as offer from '../../apiModels/offerModels';

export async function getOfferTypes(): Promise<offer.OfferType[]> {
	const query = `
    SELECT 
        offer_type_id AS "offerTypeId",
        offer_type_label AS "offerTypeLabel",
        is_enabled as "enabled"
    FROM l4l_global.offer_type`;
	return DataBase.executeQuery<offer.OfferType>(query);
}

export async function getRejectedOfferById(id: string): Promise<offer.OfferReject> {
	const query = `
    SELECT 
        offer_id as "offerId",
        title as "offerTitle",
        reason,
        o.version
    FROM l4l_global.offer_rejection as r
    INNER JOIN l4l_global.offers as o ON r.offer_id=o.id
    WHERE offer_id = $1
    `;
	return (await DataBase.executeQuery<offer.OfferReject>(query, [id]))[0];
}

export async function getOfferStatusById(id: string): Promise<{ status: string }> {
	const query = `
    SELECT status
    FROM l4l_global.offers
    WHERE id = $1
    `;
	return (await DataBase.executeQuery<{ status: string }>(query, [id]))[0];
}

export async function deleteOfferById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.offers
    WHERE id = $1
    `;
	await DataBase.executeQuery(query, [id]);
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
