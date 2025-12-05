package nl.centric.innovation.local4local.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.util.ModelConverter;
import org.springframework.stereotype.Service;

import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.interfaces.TenantService;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;

    @Override
    public Optional<Tenant> findByTenantId(UUID tenantId) {
        return tenantRepository.findById(tenantId);
    }

    @Override
    public TenantViewDto save(Tenant tenant) {
        return ModelConverter.entityToTenantViewDto(tenantRepository.save(tenant));
    }

    @Override
    public List<TenantViewDto> getAllTenants() {
        List<Tenant> tenants = (List<Tenant>) tenantRepository.findAll();
        return tenants.stream()
                .map(ModelConverter::entityToTenantViewDto)
                .collect(Collectors.toList());

    }

}
