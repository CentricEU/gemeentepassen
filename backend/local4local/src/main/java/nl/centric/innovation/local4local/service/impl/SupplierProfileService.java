package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.dto.CashierEmailResultDto;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.dto.SupplierProfilePatchDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.WorkingHours;
import nl.centric.innovation.local4local.enums.StatusUpdateEnum;
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

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.validator.Validators.isImageSizeValid;
import static nl.centric.innovation.local4local.util.validator.Validators.isKvkValid;
import static nl.centric.innovation.local4local.util.validator.Validators.isZipCodeValid;

@Service
@RequiredArgsConstructor
public class SupplierProfileService {

    private final SupplierRepository supplierRepository;

    private final SupplierProfileRepository supplierProfileRepository;

    private final UserService userService;

    private final WorkingHoursService workingHoursService;

    private final EmailService emailService;

    private final PrincipalService principalService;

    private final RejectSupplierRepository rejectSupplierRepository;


    @Value("${local4local.municipality.server.name}")
    private String baseURL;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${error.cashier.duplicate}")
    private String errorCashierEmailDuplicated;

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

            CashierEmailResultDto cashierEmailResult = getCashierEmailResultDto(dto.supplierProfilePatchDto().cashierEmails(), dto.supplierProfilePatchDto().supplierId());

            Optional<Supplier> supplier = supplierRepository.findById(dto.supplierProfilePatchDto().supplierId());
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

            if (cashierEmailResult != null) {
                if (!cashierEmailResult.newEmails().isEmpty()) {
                    userService.createCashierUsers(supplier.get(), cashierEmailResult.newEmails(), language);
                }

                /* Uncomment this code to enable Supplier delete cashiers
                if (!cashierEmailResult.deletedEmails().isEmpty()) {
                    userService.deleteCashierUsers(supplier.get(), cashierEmailResult.deletedEmails());
                }*/
            }

            sendProfileSetupEmailToAllAdmins(dto.companyName(), dto.supplierProfilePatchDto().ownerName(), language);

            return dto;
        } catch (DataIntegrityViolationException | L4LException e) {
            throw new DtoValidateException(dataIntegrityViolation);
        }
    }

    @Transactional
    public void createAndSetProfileAsAdmin(Supplier supplier, SupplierProfilePatchDto profile) throws DtoValidateException {
        try {
            if (profile.cashierEmails() != null && !profile.cashierEmails().isEmpty()) {
                validateCashierEmails(profile.cashierEmails());
            }

            SupplierProfile supplierProfile = SupplierProfile.supplierProfileToEntity(profile);
            MapUtils.setCoordonates(supplierProfile, profile.latlon());
            SupplierProfile savedProfile = supplierProfileRepository.save(supplierProfile);
            supplier.setProfile(savedProfile);
        } catch (L4LException exception) {
            throw new DtoValidateException(dataIntegrityViolation);
        }
    }

    public List<String> addCashiersToCurrentSupplier(Set<String> cashierEmails, String language) throws DtoValidateException {
        UUID supplierId = principalService.getSupplierId();
        Optional<Supplier> supplier = supplierRepository.findByIdWithWorkingHours(supplierId);

        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return addCashiers(cashierEmails, supplier.get(), language);
    }

    public List<String> addCashiers(Set<String> cashierEmails, Supplier supplier, String language) {
        List<User> createdUsers = userService.createCashierUsers(supplier, cashierEmails, language);
        return createdUsers.stream()
                .map(User::getUsername)
                .toList();

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

        supplier.setStatusUpdate(StatusUpdateEnum.SIMPLE);
        supplier.setStatus(SupplierStatusEnum.PENDING);

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

    public void saveUpdatedData(Supplier supplier, SupplierProfilePatchDto supplierProfileDto) throws DtoValidateException {
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

    public CashierEmailResultDto getCashierEmailResultDto(Set<String> emails, UUID supplierId) throws DtoValidateException {

        List<String> availableCashierEmails = userService.getCashierEmailsForSupplier(supplierId);

        Set<String> newEmails = emails != null
                ? emails.stream()
                .filter(email -> !availableCashierEmails.contains(email))
                .collect(java.util.stream.Collectors.toSet())
                : Set.of();

        Set<String> deletedEmails = emails != null
                ? availableCashierEmails.stream()
                .filter(email -> !emails.contains(email))
                .collect(java.util.stream.Collectors.toSet())
                : new HashSet<>(availableCashierEmails);

        validateCashierEmails(newEmails);

        return new CashierEmailResultDto(newEmails, deletedEmails);
    }

    public void validateCashierEmails(Set<String> emails) throws DtoValidateException {

        if (!emails.isEmpty()) {
            boolean emailExists = emails.stream()
                    .anyMatch(email -> userService.findByUsername(email).isPresent());
            if (emailExists) {
                throw new DtoValidateException(errorCashierEmailDuplicated);
            }
        }
    }

    private void validateProfileDto(SupplierProfileDto dto) throws DtoValidateException {
        if (!isKvkValid(dto.kvkNumber())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        validateZip(dto.supplierProfilePatchDto().branchZip());
        validateLogoSize(dto.supplierProfilePatchDto().logo());
    }


    private Supplier getValidSupplier(SupplierProfilePatchDto dto) throws DtoValidateException {
        validateProfilePatchDto(dto);
        Optional<Supplier> supplierOpt = supplierRepository.findById(dto.supplierId());

        if (supplierOpt.isEmpty() || supplierOpt.get().getProfile() == null) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return supplierOpt.get();
    }

    private void validateProfilePatchDto(SupplierProfilePatchDto dto) throws DtoValidateException {
        validateZip(dto.branchZip());
        validateLogoSize(dto.logo());
    }

    private void validateLogoSize(String logo) throws DtoValidateException {
        if (logo != null && !isImageSizeValid(200, logo)) {
            throw new DtoValidateException(errorSizeExceeded);
        }
    }

    private void validateZip(String zip) throws DtoValidateException {
        if (!isZipCodeValid(zip)) {
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
        supplier.setIsProfileSet(true);
        supplier.setStatus(SupplierStatusEnum.PENDING);
        supplier.setProfile(profile);
        supplier.setWorkingHours(hours);
        supplierRepository.save(supplier);
    }
}
