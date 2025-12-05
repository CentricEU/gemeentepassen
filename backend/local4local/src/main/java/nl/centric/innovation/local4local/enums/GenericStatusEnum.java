package nl.centric.innovation.local4local.enums;

import lombok.Getter;

@Getter
public enum GenericStatusEnum {
	ACTIVE("status.active"),
	EXPIRED("status.expired"),
	PENDING("status.pending"),
	REJECTED("status.rejected");

	private final String key;

	GenericStatusEnum(String key) {
		this.key = key;
	}
}
