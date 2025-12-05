package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record EnumValueDto(String key, String value) { }
