package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.dto.BenefitResponseDto;
import nl.centric.innovation.local4local.dto.BenefitSpentDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.enums.BenefitStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface BenefitRepository extends JpaRepository<Benefit, UUID> {
    String FIND_ALL_FOR_USER_BENEFITS = """
                SELECT DISTINCT new nl.centric.innovation.local4local.dto.BenefitResponseDto(b)
                FROM Benefit b
                JOIN b.citizenGroups cg
                JOIN Passholder ph ON ph.citizenGroup.id = cg.id
                WHERE b.tenantId = :tenantId
                AND ph.user.id = :userId
            """;


    @Query(FIND_ALL_FOR_USER_BENEFITS)
    List<BenefitResponseDto> findAllBenefitsForUserBenefits(@Param("tenantId") UUID tenantId,
                                                           @Param("userId") UUID userId);
    
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "CALL l4l_global.update_benefit_status()")
    void updateBenefitStatus();

    Page<Benefit> findAllByTenantId(UUID tenantId, Pageable pageable);

    List<Benefit> findAllByTenantId(UUID tenantId);

    List<Benefit> findAllByTenantIdAndStatus(UUID tenantId, BenefitStatusEnum status);

    Integer countAllByTenantId(UUID tenantId);
}
