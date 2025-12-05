package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.LoginAttempt;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface LoginAttemptRepository extends CrudRepository<LoginAttempt, Long> {
    Optional<LoginAttempt> findByRemoteAddress(String remoteAddress);
}