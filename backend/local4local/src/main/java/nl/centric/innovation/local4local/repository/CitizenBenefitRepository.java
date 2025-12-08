package nl.centric.innovation.local4local.repository;


import nl.centric.innovation.local4local.entity.CitizenBenefit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CitizenBenefitRepository extends JpaRepository<CitizenBenefit, UUID> {
    Optional<CitizenBenefit> findByUserIdAndBenefitId(UUID userId, UUID benefitId);
    List<CitizenBenefit> findByUserId(UUID userId);

}
