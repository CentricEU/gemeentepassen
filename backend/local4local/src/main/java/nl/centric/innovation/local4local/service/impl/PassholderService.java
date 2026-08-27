package nl.centric.innovation.local4local.service.impl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.FilterPassholdersRequestDto;
import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.dto.PassholderViewDto.entityToPassholderViewDto;

@Service
@RequiredArgsConstructor
public class PassholderService {

    public static final String ORDER_CRITERIA = "name";
    private final TenantRepository tenantRepository;
    private final PrincipalService principalService;
    private final PassholderRepository passholderRepository;
    private final CitizenBenefitService citizenBenefitService;
    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;
    @Value("${error.csv.manipulation}")
    private String errorCsvManipulation;
    @Value("${error.csv.date.format}")
    private String invalidDateFormat;
    @Value("${error.passholder.unique}")
    private String errorPassholderUnique;
    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;
    @Value("${error.passholder.required}")
    private String errorPassholderRequiredFields;

    @Transactional
    public List<Passholder> saveAll(List<Passholder> passholders) {
        return passholderRepository.saveAll(passholders);
    }

    public List<PassholderViewDto> getAll(Integer page, Integer size) {
        UUID tenantId = principalService.getTenantId();

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        Page<Passholder> passholders = passholderRepository.findAllByTenantIdOrderByCreatedDateDesc(tenantId, pageable);
        return passholders.stream().map(PassholderViewDto::entityToPassholderViewDto).collect(Collectors.toList());
    }

    public Integer countAll() {
        UUID tenantId = principalService.getTenantId();
        return passholderRepository.countByTenantId(tenantId);
    }

    //TODO Refactor this method both BE and FE
    public PassholderViewDto updatePassholder(@Valid PassholderViewDto passholderDto) throws DtoValidateException {
        Tenant tenant = getTenant();
        Passholder passholder = findByIdAndTenantId(passholderDto.id(), tenant.getId());

        Passholder passholderToSave = Passholder.passholderViewDtoToEntity(passholderDto, tenant);
        passholderToSave.setId(passholderDto.id());
        passholderToSave.setUser(passholder.getUser());

        return entityToPassholderViewDto(passholderRepository.save(passholderToSave));
    }

    public Passholder getPassholderByPassNumber(String passNumber) throws DtoValidateNotFoundException {
        return passholderRepository.findByPassNumber(passNumber)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
    }

    public PassholderViewDto getPassholderDetails(UUID passholderId) throws DtoValidateNotFoundException {
        UUID tenantId = principalService.getTenantId();
        Passholder passholder = passholderRepository.findByIdAndTenantId(passholderId, tenantId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
        return entityToPassholderViewDto(passholder);
    }

    public void saveUserForPassholder(Passholder passholder, User user) {
        passholder.setUser(user);
        passholderRepository.save(passholder);
        citizenBenefitService.createCitizenBenefitForUserIdAndBenefits(user.getId(), passholder.getCitizenGroup().getBenefits());

    }

    public Passholder findById(UUID passholderId) throws DtoValidateNotFoundException {
        return passholderRepository.findById(passholderId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
    }

    public Passholder findByIdAndTenantId(UUID passholderId, UUID tenantId) throws DtoValidateNotFoundException {
        return passholderRepository.findByIdAndTenantId(passholderId, tenantId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
    }

    public void deleteById(UUID passholderId) {
        passholderRepository.deleteById(passholderId);
    }

    public List<PassholderViewDto> getFilteredPassholders(FilterPassholdersRequestDto filterParams, Integer pageIndex, Integer pageSize) {
        UUID tenantId = principalService.getTenantId();


        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(ORDER_CRITERIA));
        Page<Passholder> passholders = passholderRepository.findAllByFilterCriteria(
                tenantId,
                StringUtils.isNotBlank(filterParams.bsn()) ? "%" + filterParams.bsn().toLowerCase() + "%" : null,
                StringUtils.isNotBlank(filterParams.passNumber()) ? "%" + filterParams.passNumber().toLowerCase() + "%" : null,
                pageable
        );

        return passholders.stream().map(PassholderViewDto::entityToPassholderViewDto).collect(Collectors.toList());
    }

    public Integer countFilteredPassholders(FilterPassholdersRequestDto filterParams) {
        UUID tenantId = principalService.getTenantId();

        return passholderRepository.countAllByFilterCriteria(
                tenantId,
                StringUtils.isNotBlank(filterParams.bsn()) ? "%" + filterParams.bsn().toLowerCase() + "%" : null,
                StringUtils.isNotBlank(filterParams.passNumber()) ? "%" + filterParams.passNumber().toLowerCase() + "%" : null
        );
    }

    private Tenant getTenant() throws DtoValidateNotFoundException {
        UUID tenantUUID = principalService.getTenantId();
        Optional<Tenant> tenant = tenantRepository.findById(tenantUUID);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        return tenant.get();
    }


}
