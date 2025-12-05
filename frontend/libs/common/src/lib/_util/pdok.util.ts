import { SupplierCoordinates } from '../_models/supplier-coordinates.model';

export class PdokUtil {
	public static getCoordinatesFromPdok(data: any): SupplierCoordinates {
		const pointString = data.response.docs[0].centroide_ll;

		const coordinatesMatch = pointString.match(/POINT\(([-0-9.]+) ([-0-9.]+)\)/);

		const longitude = parseFloat(coordinatesMatch[1]);
		const latitude = parseFloat(coordinatesMatch[2]);

		return new SupplierCoordinates(longitude, latitude);
	}
}
