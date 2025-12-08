package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends CrudRepository<User, UUID> {

    String FIND_USER_BY_BSN = """
            SELECT p.user FROM Passholder p WHERE p.bsn = :bsn
            """;
    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findById(UUID userId);

    Optional<User> findBySupplierId(UUID supplierId);
    
    List<User> findAllByTenantIdAndRole(UUID tenantId, Role userRole);

    Page<User> findAllByTenantIdAndRole(UUID tenantId, Role userRole, Pageable pageable);

    List<User> findAllBySupplierIdAndRole(UUID supplierId, Role userRole);

    Integer countAllByTenantIdAndRole(UUID tenantId, Role userRole);

    @Query(FIND_USER_BY_BSN)
    Optional<User> findUserByBsn(@Param("bsn") String bsn);

}
