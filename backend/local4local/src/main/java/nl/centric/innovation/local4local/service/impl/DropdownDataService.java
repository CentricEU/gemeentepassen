package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.DropdownDataFilterDto;
import nl.centric.innovation.local4local.dto.EnumValueDto;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DropdownDataService {

    private final OfferTypeRepository offerTypeRepository;

    public DropdownDataFilterDto getAllDropdownsData() {
        List<EnumValueDto> statusDto = Arrays.stream(GenericStatusEnum.values())
                .map(status -> new EnumValueDto(status.name(), status.getKey()))
                .toList();

        List<OfferType> offerTypes = offerTypeRepository.findAll();

        return new DropdownDataFilterDto(statusDto, offerTypes);
    }
}
