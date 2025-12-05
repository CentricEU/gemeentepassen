package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Tenant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TenantRepository extends CrudRepository<Tenant, UUID> {
}