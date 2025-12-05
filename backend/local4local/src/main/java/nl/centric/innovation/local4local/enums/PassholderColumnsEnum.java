package nl.centric.innovation.local4local.enums;

public enum PassholderColumnsEnum {

	NAME("name"),
	BSN("bsn"),
	ADDRESS("address"),
	PASS_NUMBER("passNumber"),
	RESIDENCE_CITY("residenceCity"),
	EXPIRING_DATE("expiringDate");

	private final String csvColumn;

	PassholderColumnsEnum(String csvColumn) {
		this.csvColumn = csvColumn;
	}

	public String getCsvColumn() {
		return csvColumn;
	}
}