package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.ConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, UUID> {
    Optional<ConfirmationToken> findByToken(String token);

    Optional<ConfirmationToken> findByUserId(UUID uuid);
}
