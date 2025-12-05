package nl.centric.innovation.local4local.service.interfaces;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.entity.Tenant;

public interface TenantService {

    public Optional<Tenant> findByTenantId(UUID clientId);

    public TenantViewDto save(Tenant client);

    public List<TenantViewDto> getAllTenants();

}
