package nl.centric.innovation.local4local.service.interfaces;

import nl.centric.innovation.local4local.dto.RestrictionRequestDto;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;

public interface RestrictionService {
    Restriction saveRestriction(RestrictionRequestDto restrictionRequestDto) throws DtoValidateException;

}
