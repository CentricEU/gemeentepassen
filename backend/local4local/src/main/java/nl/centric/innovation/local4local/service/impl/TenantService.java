package nl.centric.innovation.local4local.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.TenantBankInformationDto;
import nl.centric.innovation.local4local.dto.TenantDto;
import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.repository.TenantRepository;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final PrincipalService principalService;

    private final TenantRepository tenantRepository;

    @Value("${error.unique.violation}")
    private String errorUniqueViolation;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    public TenantViewDto findByTenantId(UUID tenantId) throws DtoValidateException {
        Optional<Tenant> tenant = tenantRepository.findById(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        return TenantViewDto.entityToTenantViewDto(tenant.get(), true);
    }

    public TenantViewDto save(TenantDto tenant) {
        Tenant tenantEntity = Tenant.tenantDtoToEntity(tenant);
        return TenantViewDto.entityToTenantViewDto(tenantRepository.save(tenantEntity), true);
    }

    public List<TenantViewDto> getAllTenants() {
        List<Tenant> tenants = (List<Tenant>) tenantRepository.findAll();
        return tenants.stream()
                .map(tenant -> TenantViewDto.entityToTenantViewDto(tenant, false))
                .toList();

    }

    public void saveTenantBankInformation(TenantBankInformationDto tenantBankInformationDto) throws DtoValidateException {
        Optional<Tenant> tenant = tenantRepository.findById(principalService.getTenantId());

        if (tenant.isEmpty()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        Tenant tenantWithBankInformation = tenant.get();

        if (StringUtils.isNotBlank(tenantWithBankInformation.getIban())) {
            throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
        }

        tenantWithBankInformation.setBic(tenantBankInformationDto.bic());
        tenantWithBankInformation.setIban(tenantBankInformationDto.iban());
        tenantRepository.save(tenantWithBankInformation);
    }

}
