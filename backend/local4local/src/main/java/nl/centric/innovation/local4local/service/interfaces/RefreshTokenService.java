package nl.centric.innovation.local4local.service.interfaces;

import nl.centric.innovation.local4local.dto.TokenRefreshResponseDto;
import nl.centric.innovation.local4local.entity.RefreshToken;
import nl.centric.innovation.local4local.entity.User;

import java.util.Optional;

public interface RefreshTokenService {
    Optional<RefreshToken> findByToken(String token);

    RefreshToken getRefreshToken(User user);

    TokenRefreshResponseDto refreshToken(String requestRefreshToken);

    void deleteByToken(String token);
}
