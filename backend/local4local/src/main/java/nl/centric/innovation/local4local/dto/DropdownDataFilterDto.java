package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.OfferType;

import java.util.List;

@Builder
public record DropdownDataFilterDto(
        List<EnumValueDto> statuses,
        List<OfferType> offerTypes) { }
