package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CitizenGroupDto;
import nl.centric.innovation.local4local.dto.CitizenGroupViewDto;
import nl.centric.innovation.local4local.entity.CitizenGroupAssignment;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.RequiredDocuments;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.GroupCitizenAssignmentRepository;
import nl.centric.innovation.local4local.repository.CitizenGroupRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class CitizenGroupService {
    public static final String ORDER_CRITERIA = "createdDate";

    private final CitizenGroupRepository citizenGroupRepository;
    private final GroupCitizenAssignmentRepository groupCitizenAssignmentRepository;
    private final TenantRepository tenantRepository;
    private final PrincipalService principalService;
    private final EmailService emailService;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${local4local.municipality.server.name}")
    private String baseMunicipalityUrl;

    public CitizenGroupDto save(CitizenGroupDto citizenGroup) throws DtoValidateException {
        UUID tenantId = principalService.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        validateMaxIncome(citizenGroup, tenant.getWage());

        citizenGroupRepository.save(CitizenGroup.fromDto(citizenGroup, tenantId));
        return citizenGroup;
    }

    public List<CitizenGroupViewDto> getAllByTenantIdPaginated(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA).descending());
        Page<CitizenGroup> citizenGroups = citizenGroupRepository.findAllByTenantId(principalService.getTenantId(), pageable);

        return citizenGroups.stream()
                .map(CitizenGroupViewDto::entityToCitizenGroupViewDto)
                .toList();
    }

    public List<CitizenGroupViewDto> getAllByTenantId() {
        boolean isCitizen = principalService.getUser().getRole().getName().equals(Role.ROLE_CITIZEN);
        UUID tenantId = principalService.getTenantId();

        List<CitizenGroup> citizenGroups = isCitizen
                ? citizenGroupRepository.findAllByTenantIdAndBenefitsIsNotEmpty(tenantId)
                : citizenGroupRepository.findAllByTenantId(tenantId);

        return citizenGroups.stream()
                .map(CitizenGroupViewDto::entityToCitizenGroupViewDto)
                .toList();
    }

    public long countAllByTenantId() {
        return citizenGroupRepository.countAllByTenantId(principalService.getTenantId());
    }

    public Set<CitizenGroup> getAllByIdsAndTenantId(Set<UUID> ids, UUID tenantId) {
        return citizenGroupRepository.findByIdInAndTenantId(ids, tenantId);
    }

    public void assignCitizenGroupToCitizen(UUID groupId) throws DtoValidateException {
        Optional<CitizenGroup> citizenGroup = citizenGroupRepository.findById(groupId);

        if (citizenGroup.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        if (!citizenGroup.get().getTenantId().equals(principalService.getTenantId())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        groupCitizenAssignmentRepository.save(
                CitizenGroupAssignment.from(citizenGroup.get(), getCitizenId())
        );
    }

    public List<RequiredDocuments> getAllRequiredDocuments() throws DtoValidateNotFoundException {
        Optional<CitizenGroupAssignment> citizenGroupAssignment = groupCitizenAssignmentRepository.findByCitizenId(getCitizenId());

        if (citizenGroupAssignment.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return Arrays.asList(citizenGroupAssignment.get().getCitizenGroup().getRequiredDocuments());
    }

    public void sendCitizenMessage(String message) throws DtoValidateNotFoundException {
        UUID tenantId = principalService.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        emailService.sendNoCategoryEmail(baseMunicipalityUrl, tenant.getEmail(), StringUtils.getLanguageForLocale("nl-NL"), message);
    }

    private void validateMaxIncome(CitizenGroupDto citizenGroup, Double tenantWage) throws DtoValidateException {
        Double calculatedMaxIncome = (citizenGroup.thresholdAmount().doubleValue() / 100) * tenantWage;

        if (!String.format("%.2f", calculatedMaxIncome)
                .equals(String.format("%.2f", citizenGroup.maxIncome()))) {
            throw new DtoValidateException(String.format(
                    "Invalid max income. Expected: €%.2f, Provided: €%.2f",
                    calculatedMaxIncome, citizenGroup.maxIncome()
            ));
        }
    }

    private UUID getCitizenId() {
        return principalService.getUser().getId();
    }
}
