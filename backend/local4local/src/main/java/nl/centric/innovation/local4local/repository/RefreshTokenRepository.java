package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUserId(UUID userId);

    @Modifying
    @Query("delete from RefreshToken rt where rt.token = :token")
    void deleteByToken(@Param("token") String token);

}
