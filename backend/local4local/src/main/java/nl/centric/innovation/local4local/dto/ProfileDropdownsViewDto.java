package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ProfileDropdownsViewDto(
        List<CategoryDto> categories,
        List<LegalFormDto> legalFormLabels,
        List<GroupDto> groupLabels
) {
}
