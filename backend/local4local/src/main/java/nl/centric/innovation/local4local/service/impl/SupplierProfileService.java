package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.dto.SupplierProfilePatchDto;
import nl.centric.innovation.local4local.entity.*;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.L4LException;
import nl.centric.innovation.local4local.repository.RejectSupplierRepository;
import nl.centric.innovation.local4local.repository.SupplierProfileRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;
import nl.centric.innovation.local4local.util.MapUtils;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static nl.centric.innovation.local4local.util.validator.Validators.isImageSizeValid;
import static nl.centric.innovation.local4local.util.validator.Validators.isKvkValid;
import static nl.centric.innovation.local4local.util.validator.Validators.isTelephoneValid;
import static nl.centric.innovation.local4local.util.validator.Validators.isZipCodeValid;

@Service
@RequiredArgsConstructor
public class SupplierProfileService {

    private final SupplierRepository supplierRepository;

    private final SupplierProfileRepository supplierProfileRepository;

    private final SupplierService supplierService;

    private final UserService userService;

    private final WorkingHoursService workingHoursService;

    private final EmailService emailService;

    private final PrincipalService principalService;

    private final RejectSupplierRepository rejectSupplierRepository;


    @Value("${local4local.municipality.server.name}")
    private String baseURL;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${error.mail.alreadyUsed}")
    private String errorEmailAlreadyUsed;

    @Value("${error.mail.requirements}")
    private String errorMailRequirements;

    @Value("${error.unique.violation}")
    private String errorUniqueViolation;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.size.exceeded}")
    private String errorSizeExceeded;

    @Value("${error.constraint.dataIntegrity}")
    private String dataIntegrityViolation;

    @Value("${error.reapply.notAllowed}")
    private String errorReapplyNotAllowed;

    @Transactional(rollbackFor = DtoValidateException.class)
    public SupplierProfileDto save(SupplierProfileDto dto, String language) throws DtoValidateException {
        try {
            validateProfileDto(dto);
            validateCashierEmails(dto.supplierProfilePatchDto().cashierEmails());

            Optional<Supplier> supplier = supplierService.findBySupplierId(dto.supplierProfilePatchDto().supplierId());

            if (supplier.isEmpty()) {
                throw new DtoValidateNotFoundException(errorEntityNotFound);
            }

            if (supplier.get().getProfile() != null) {
                throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
            }

            List<WorkingHours> workingHours = workingHoursService.createWorkingHours(dto.supplierProfilePatchDto().workingHours(), supplier.get());
            SupplierProfile profile = buildProfileEntity(dto);
            SupplierProfile savedProfile = supplierProfileRepository.save(profile);
            updateSupplierWithProfile(supplier.get(), savedProfile, workingHours);
            userService.createCashierUsers(supplier.get(), dto.supplierProfilePatchDto().cashierEmails(), language);
            sendProfileSetupEmailToAllAdmins(dto.companyName(), dto.supplierProfilePatchDto().ownerName(), language);

            return dto;
        } catch (DataIntegrityViolationException | L4LException e) {
            throw new DtoValidateException(dataIntegrityViolation);
        }
    }

    public void updateSupplierProfile(SupplierProfilePatchDto dto) throws DtoValidateException {
        Supplier supplier = getValidSupplier(dto);
        saveUpdatedData(supplier, dto);
    }

    public void reapplySupplierProfile(SupplierProfilePatchDto dto, String language) throws DtoValidateException {
        Supplier supplier = getValidSupplier(dto);

        if (supplier.getStatus() != SupplierStatusEnum.REJECTED) {
            throw new DtoValidateException(errorReapplyNotAllowed);
        }

        supplierService.updateSupplierStatus(supplier, SupplierStatusEnum.PENDING);
        sendProfileSetupEmailToAllAdmins(supplier.getCompanyName(), dto.ownerName(), language);
        rejectSupplierRepository.findBySupplierId(supplier.getId())
                .ifPresent(reject -> rejectSupplierRepository.deleteById(reject.getId()));

        saveUpdatedData(supplier, dto);
    }

    public void sendProfileSetupEmailToAllAdmins(String companyName, String accountManager, String language) {
        String[] emailsArray = userService.findAllAdminsByTenantId(principalService.getTenantId())
                .stream().map(User::getUsername).toArray(String[]::new);

        String url = baseURL + "/suppliers";

        emailService.sendProfileCreatedEmail(url, emailsArray, StringUtils.getLanguageForLocale(language),
                principalService.getTenant().getName(), companyName,
                accountManager);
    }

    private void validateProfileDto(SupplierProfileDto dto) throws DtoValidateException {
        if (!isKvkValid(dto.kvkNumber())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        validateZipAndPhone(dto.supplierProfilePatchDto().branchZip(), dto.supplierProfilePatchDto().branchTelephone());
        validateLogoSize(dto.supplierProfilePatchDto().logo());
    }

    private void validateCashierEmails(Set<String> emails) throws DtoValidateException {
        if (emails != null && !emails.isEmpty()) {
            boolean emailExists = emails.stream()
                    .anyMatch(email -> userService.findByUsername(email).isPresent());
            if (emailExists) {
                throw new DtoValidateException(errorEmailAlreadyUsed);
            }
        }
    }

    private Supplier getValidSupplier(SupplierProfilePatchDto dto) throws DtoValidateException {
        validateProfilePatchDto(dto);
        Optional<Supplier> supplierOpt = supplierService.findBySupplierId(dto.supplierId());

        if (supplierOpt.isEmpty() || supplierOpt.get().getProfile() == null) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return supplierOpt.get();
    }

    private void validateProfilePatchDto(SupplierProfilePatchDto dto) throws DtoValidateException {
        validateZipAndPhone(dto.branchZip(), dto.branchTelephone());
        validateLogoSize(dto.logo());
    }

    private void validateLogoSize(String logo) throws DtoValidateException {
        if (logo != null && !isImageSizeValid(200, logo)) {
            throw new DtoValidateException(errorSizeExceeded);
        }
    }

    private void validateZipAndPhone(String zip, String phone) throws DtoValidateException {
        if (!isZipCodeValid(zip) || !isTelephoneValid(phone)) {
            throw new DtoValidateException(errorEntityValidate);
        }
    }

    private SupplierProfile buildProfileEntity(SupplierProfileDto dto) throws L4LException {
        SupplierProfile profile = SupplierProfile.supplierProfileToEntity(dto);
        MapUtils.setCoordonates(profile, dto.supplierProfilePatchDto().latlon());

        if (dto.supplierProfilePatchDto().subcategory() == null) {
            profile.setSubcategory(null);
        }

        return profile;
    }

    private void updateSupplierWithProfile(Supplier supplier, SupplierProfile profile, List<WorkingHours> hours) {
        supplierRepository.updateProfileAndStatus(
                supplier.getId(), profile.getId(), SupplierStatusEnum.PENDING.name());

        supplier.setWorkingHours(hours);
        supplierRepository.save(supplier);
    }

    private void saveUpdatedData(Supplier supplier, SupplierProfilePatchDto supplierProfileDto) throws DtoValidateException {
        try {
            SupplierProfile supplierProfile = SupplierProfile.supplierProfileToEntity(supplierProfileDto);
            MapUtils.setCoordonates(supplierProfile, supplierProfileDto.latlon());

            supplierProfile.setId(supplier.getProfile().getId());

            if (supplierProfileDto.subcategory() == null) {
                supplierProfile.setSubcategory(null);
            }

            supplierProfileRepository.save(supplierProfile);
            supplierRepository.save(supplier);
        } catch (DataIntegrityViolationException | L4LException exception) {
            throw new DtoValidateException(dataIntegrityViolation);
        }
    }

}
