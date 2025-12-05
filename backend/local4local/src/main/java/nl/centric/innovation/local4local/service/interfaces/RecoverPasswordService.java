package nl.centric.innovation.local4local.service.interfaces;

import nl.centric.innovation.local4local.entity.RecoverPassword;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.RecoverException;

import java.util.Optional;
import java.util.UUID;

public interface RecoverPasswordService {
    Optional<RecoverPassword> findRecoverPasswordByToken(String token) throws RecoverException, DtoValidateNotFoundException;
    Integer countAllByUserInLastDay(UUID userId);
    RecoverPassword save(RecoverPassword recoverPassword);
}
