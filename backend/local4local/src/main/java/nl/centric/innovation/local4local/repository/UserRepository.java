package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@JaversSpringDataAuditable
public interface UserRepository extends CrudRepository<User, UUID> {

    String FIND_USER_BY_BSN = """
            SELECT p.user FROM Passholder p WHERE p.bsn = :bsn
            """;

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findById(UUID userId);

    Optional<User> findBySupplierId(UUID supplierId);

    Optional<User> findBySupplierIdAndRole_Name(UUID supplierId, String roleName);

    @RestResource(path = "list")
    List<User> findAllByTenantIdAndRole(UUID tenantId, Role userRole);

    @RestResource(path = "list")
    List<User> findAllByTenantIdAndRoleIn(UUID tenantId, List<Role> roles);

    Page<User> findAllByTenantIdAndRole(UUID tenantId, Role userRole, Pageable pageable);

    Page<User> findAllByTenantIdAndRoleIn(UUID tenantId, List<Role> roles, Pageable pageable);

    List<User> findAllBySupplierIdAndRole(UUID supplierId, Role userRole);

    Integer countAllByTenantIdAndRole(UUID tenantId, Role userRole);

    Integer countAllByTenantIdAndRoleIn(UUID tenantId, List<Role> roles);

    @Query(FIND_USER_BY_BSN)
    Optional<User> findUserByBsn(@Param("bsn") String bsn);

}
