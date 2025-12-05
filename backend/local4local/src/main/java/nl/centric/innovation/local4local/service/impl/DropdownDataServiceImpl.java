package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.DropdownDataFilterDto;
import nl.centric.innovation.local4local.dto.EnumValueDto;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.service.interfaces.DropdownDataService;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DropdownDataServiceImpl  implements DropdownDataService {

    private final OfferTypeRepository offerTypeRepository;

    @Override
    public DropdownDataFilterDto getAllDropdownsData() {
        List<EnumValueDto> statusDto = Arrays.stream(GenericStatusEnum.values())
                .map(status -> new EnumValueDto(status.name(), status.getKey()))
                .collect(Collectors.toList());

        List<OfferType> offerTypes = offerTypeRepository.findAll();

        return new DropdownDataFilterDto(statusDto, offerTypes);
    }
}
