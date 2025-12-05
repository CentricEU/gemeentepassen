package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.RecoverPassword;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.RecoverException;
import nl.centric.innovation.local4local.repository.RecoverPasswordRepository;
import nl.centric.innovation.local4local.service.interfaces.RecoverPasswordService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RecoverPasswordServiceImpl implements RecoverPasswordService {

    private final RecoverPasswordRepository recoverPasswordRepository;

    @Value("${error.recovery.expired}")
    private String errorRecoverExpired;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    private static final int HOUR_LIMIT = 2;

    @Override
    public Optional<RecoverPassword> findRecoverPasswordByToken(String token) throws RecoverException, DtoValidateNotFoundException {
        Optional<RecoverPassword> resetPasswordToken = recoverPasswordRepository.findByTokenAndIsActiveTrue(token);

        if (resetPasswordToken.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        validateRecoverTime(resetPasswordToken.get().getTokenExpirationDate().getTime());

        return resetPasswordToken;
    }

    @Override
    public Integer countAllByUserInLastDay(UUID userId) {
        return recoverPasswordRepository.countRecoveryRequestsInLastDayByUser(userId);
    }

    @Override
    public RecoverPassword save(RecoverPassword recoverPassword) {
        return recoverPasswordRepository.save(recoverPassword);
    }

    private void validateRecoverTime(long tokenExpirationDate) throws RecoverException {
        long timeDifference = new Date().getTime() - tokenExpirationDate;
        long hoursDifference = TimeUnit.MILLISECONDS.toHours(timeDifference);

        if (hoursDifference >= HOUR_LIMIT) {
            throw new RecoverException(errorRecoverExpired);
        }
    }
}
