package nl.centric.innovation.local4local.util;

import org.apache.commons.csv.CSVRecord;

import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.enums.PassholderColumnsEnum;

public class CsvUtil {
	
	public static Passholder parsePassholderFromRecord(CSVRecord csvRecord) {
		
		return Passholder.builder().address(csvRecord.get(PassholderColumnsEnum.ADDRESS.getCsvColumn()))
		.bsn(csvRecord.get(PassholderColumnsEnum.BSN.getCsvColumn()))
		.name(csvRecord.get(PassholderColumnsEnum.NAME.getCsvColumn()))
		.passNumber(csvRecord.get(PassholderColumnsEnum.PASS_NUMBER.getCsvColumn()))
		.residenceCity(csvRecord.get(PassholderColumnsEnum.RESIDENCE_CITY.getCsvColumn()))
		.build();
	}
}