package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.authentication.JwtUtil;
import nl.centric.innovation.local4local.dto.TokenRefreshResponseDto;
import nl.centric.innovation.local4local.entity.RefreshToken;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.TokenRefreshException;
import nl.centric.innovation.local4local.repository.RefreshTokenRepository;
import nl.centric.innovation.local4local.service.interfaces.RefreshTokenService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.ClaimsUtils.setClaims;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {
    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenDuration;

    private final RefreshTokenRepository refreshTokenRepository;

    private final JwtUtil jwtUtil;

    @Value("${error.refresh.expired}")
    private String errorRefreshTokenExpired;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    public RefreshToken getRefreshToken(User user) {

        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByUserId(user.getId());

        if (refreshToken.isEmpty()) {
            return createRefreshToken(user);
        }

        try {
            verifyExpiration(refreshToken.get());
            return refreshToken.get();
        } catch (TokenRefreshException tokenRefreshException) {
            return createRefreshToken(user);
        }

    }

    @Override
    public TokenRefreshResponseDto refreshToken(String requestRefreshToken) {
        if (StringUtils.isBlank(requestRefreshToken)) {
            throw new TokenRefreshException(requestRefreshToken, errorEntityValidate);
        }
        Optional<RefreshToken> optionalToken = findByToken(requestRefreshToken);

        if (optionalToken.isEmpty()) {
            throw new TokenRefreshException(requestRefreshToken, errorEntityNotFound);
        }

        RefreshToken refreshToken = optionalToken.get();
        verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        String token = jwtUtil.generateToken(setClaims(user), user);

        return TokenRefreshResponseDto.builder()
                .accessToken(token)
                .refreshToken(requestRefreshToken)
                .build();
    }

    @Transactional
    @Override
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }

    private void verifyExpiration(RefreshToken token) throws TokenRefreshException {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), errorRefreshTokenExpired);
        }
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshTokenDuration * 1000))
                .token(UUID.randomUUID().toString())
                .build();

        newRefreshToken = refreshTokenRepository.save(newRefreshToken);
        return newRefreshToken;
    }

}
