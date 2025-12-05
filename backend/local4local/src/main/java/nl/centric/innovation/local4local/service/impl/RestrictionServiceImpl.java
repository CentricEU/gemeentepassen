package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.RestrictionRequestDto;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.RestrictionRepository;
import nl.centric.innovation.local4local.service.interfaces.RestrictionService;
import nl.centric.innovation.local4local.util.ModelConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class RestrictionServiceImpl implements RestrictionService {

    private final RestrictionRepository restrictionRepository;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Override
    public Restriction saveRestriction(RestrictionRequestDto restrictionRequestDto) throws DtoValidateException {
        validateRestriction(restrictionRequestDto);
        Restriction restriction = ModelConverter.restrictionRequestDtoToEntity(restrictionRequestDto);
        return restrictionRepository.save(restriction);
    }

    private void validateRestriction(RestrictionRequestDto restrictionRequestDto) throws DtoValidateException {

        if (restrictionRequestDto.timeFrom() != null && restrictionRequestDto.timeTo() != null
                && restrictionRequestDto.timeFrom().compareTo(restrictionRequestDto.timeTo()) >= 0) {
            throw new DtoValidateException(errorEntityValidate);
        }

        if (restrictionRequestDto.maxPrice() != null && restrictionRequestDto.minPrice() != null
                && restrictionRequestDto.maxPrice() - restrictionRequestDto.minPrice() < 1) {
            throw new DtoValidateException(errorEntityValidate);
        }
    }
}
