package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.ConfirmationToken;
import nl.centric.innovation.local4local.repository.ConfirmationTokenRepository;
import nl.centric.innovation.local4local.service.interfaces.ConfirmationTokenService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConfirmationTokenServiceImpl implements ConfirmationTokenService {

    private final ConfirmationTokenRepository confirmationTokenRepository;

    @Override
    public ConfirmationToken save(ConfirmationToken confirmationToken) {
        return confirmationTokenRepository.save(confirmationToken);
    }
}
