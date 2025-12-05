package nl.centric.innovation.local4local.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.GrantViewDtoTable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import nl.centric.innovation.local4local.dto.GrantRequestDto;
import nl.centric.innovation.local4local.dto.GrantViewDto;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.GrantRepository;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.ModelConverter;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class GrantService {

    private final ResourceBundleMessageSource messageSource;

    private final GrantRepository grantRepository;

    private final TenantService tenantService;

    private final PrincipalService principalService;

    @Value("${error.general.availability}")
    private String errorGeneralAvailability;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    public static final String ORDER_CRITERIA = "title";

    public GrantViewDto createGrant(GrantRequestDto grantRequestDto) throws DtoValidateException {
        if (grantRequestDto.startDate().compareTo(grantRequestDto.expirationDate()) >= 0) {
            throw new DtoValidateException(errorGeneralAvailability);
        }

        Optional<Tenant> tenant = tenantService.findByTenantId(getTenantId());

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        Grant grant = grantRepository.save(ModelConverter.grantRequestDtoToEntity(grantRequestDto, tenant.get()));

        return GrantViewDto.entityToGrantViewDto(grant);
    }

    public GrantViewDto editGrant(GrantViewDto grantViewDto) throws DtoValidateException {
        Optional<Grant> grantToUpdate = grantRepository.findById(grantViewDto.id());

        if (grantToUpdate.isEmpty()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        if (grantViewDto.startDate().compareTo(grantViewDto.expirationDate()) >= 0) {
            throw new DtoValidateException(errorGeneralAvailability);
        }

        Grant grant = Grant.grantViewDtoToEntity(grantViewDto, grantToUpdate.get().getTenant());
        grant.setId(grantViewDto.id());

        return GrantViewDto.entityToGrantViewDto(grantRepository.save(grant));
    }

    public List<GrantViewDtoTable> getAllPaginated(Integer page, Integer size, String language) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        Page<Grant> grants = grantRepository.findAllByTenantId(getTenantId(), pageable);

        return grants.stream()
                .map(GrantViewDtoTable::entityToGrantViewDtoTable)
                .toList();

    }

    public List<GrantViewDto> getAll(Boolean isActiveGrantNeeded) {
        List<Grant> grants = getGrants(isActiveGrantNeeded, getTenantId());
        return grants.stream().map(GrantViewDto::entityToGrantViewDto).collect(Collectors.toList());
    }

    public Integer countAll() {
        return grantRepository.countByTenantId(getTenantId());
    }

    public Set<Grant> getAllInIds(Set<UUID> ids) {
        return grantRepository.findByIdIn(ids);
    }

    private List<Grant> getGrants(Boolean isActiveGrantNeeded, UUID tenantId) {
        if (isActiveGrantNeeded) {
            return grantRepository.findAllByTenantIdAndExpirationDateAfter(tenantId, LocalDate.now());
        }
        return grantRepository.findAllByTenantId(tenantId);
    }

    private UUID getTenantId() {
        return principalService.getTenantId();
    }

}
