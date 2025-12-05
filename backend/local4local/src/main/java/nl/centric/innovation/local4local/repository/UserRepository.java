package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends CrudRepository<User, UUID> {

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findById(UUID userId);

    Optional<User> findBySupplierId(UUID supplierId);
    
    List<User> findAllByTenantIdAndRole(UUID tenantId, Role userRole);
    
    List<User> findAllBySupplierId(UUID supplierId);


}
