package nl.centric.innovation.local4local.service.impl;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.util.IOUtils;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CashierEmailResultDto;
import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RegisterUserDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.SupplierForMapViewDto;
import nl.centric.innovation.local4local.dto.SupplierProfileIncompleteViewDto;
import nl.centric.innovation.local4local.dto.SupplierProfileResult;
import nl.centric.innovation.local4local.dto.SupplierProfileViewDto;
import nl.centric.innovation.local4local.dto.SupplierRequestPatchDto;
import nl.centric.innovation.local4local.dto.SupplierViewDto;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.WorkingHours;
import nl.centric.innovation.local4local.enums.RejectionReason;
import nl.centric.innovation.local4local.enums.StatusUpdateEnum;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.exceptions.UnauthorizedActionException;
import nl.centric.innovation.local4local.repository.RejectSupplierRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.repository.UserRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;
import nl.centric.innovation.local4local.util.ModelConverter;
import nl.centric.innovation.local4local.util.StringUtils;
import org.javers.core.Javers;
import org.javers.core.diff.Diff;
import org.javers.core.diff.changetype.PropertyChange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.PropertySource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.util.validator.Validators.isKvkValid;
import static nl.centric.innovation.local4local.util.validator.Validators.isZipCodeValid;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class SupplierService {

    public static final String ORDER_CRITERIA = "companyName";

    private final RejectSupplierRepository rejectSupplierRepository;

    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    private final TenantRepository tenantRepository;

    private final UserService userService;

    private final EmailService emailService;

    private final AmazonS3 amazonS3Client;

    private final PrincipalService principalService;

    private final SupplierProfileService supplierProfileService;

    private final WorkingHoursService workingHoursService;

    private final MessageSource messageSource;

    private final Javers javers;

    //private final QRCodeGenerator qrCodeGenerator;

    @Value("${error.unique.violation}")
    private String errorUniqueViolation;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.terms.notagreed}")
    private String errorTermsNotAgreed;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${local4local.server.name}")
    private String baseURL;

    @Value("${local4local.backend.name}")
    private String backendBaseUrl;

    @Value("${aws.s3.bucketName.qrCodes}")
    private String s3BucketName;

    @Value("${error.unauthorizedAction}")
    private String errorUnauthorizedAction;


    public Supplier getSupplierAndValidateOnPrincipal(UUID supplierId) throws DtoValidateNotFoundException {
        Supplier supplier = supplierRepository.findWithSupplierProfileById(supplierId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        User user = principalService.getUser();

        if (user.getSupplier() == null || !supplier.getId().equals(user.getSupplier().getId())) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return supplier;
    }

    public Supplier getSupplierAndValidateOnTenant(UUID supplierId) throws DtoValidateNotFoundException {
        Supplier supplier = supplierRepository.findWithSupplierProfileById(supplierId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        User user = principalService.getUser();

        if (supplier.getTenant() == null || !supplier.getTenant().getId().equals(user.getTenantId())) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return supplier;
    }

    public Supplier getSupplierAndValidateOnPrincipalOrSuperAdmin(UUID supplierId) throws DtoValidateNotFoundException {
        Supplier supplier = supplierRepository.findWithSupplierProfileById(supplierId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        User user = principalService.getUser();

        boolean isSupplier = Role.ROLE_SUPPLIER.equals(user.getRole().getName());

        if (isSupplier && (user.getSupplier() == null || !supplier.getId().equals(user.getSupplier().getId()))) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return supplier;
    }

    public Optional<Supplier> findBySupplierId(UUID supplierId) {
        return supplierRepository.findWithSupplierProfileById(supplierId);
    }

    public Optional<RejectSupplier> findRejectedSupplier(UUID supplierId) {
        return rejectSupplierRepository.findBySupplierId(supplierId);
    }

    public void rejectSupplier(RejectSupplierDto rejectSupplierDto, String language)
            throws DtoValidateException, DataIntegrityViolationException {
        try {
            Optional<Supplier> supplier = findBySupplierId(rejectSupplierDto.supplierId());

            if (supplier.isEmpty()) {
                throw new DtoValidateNotFoundException(errorEntityNotFound);
            }

            enforceAdminTenantOwnership(supplier.get());

            RejectSupplier rejectSupplier = ModelConverter.rejectSupplierToEntity(rejectSupplierDto, supplier.get());


            rejectSupplierRepository.save(rejectSupplier);
            updateSupplierStatus(supplier.get(), SupplierStatusEnum.REJECTED);
            sendRejectEmailToSupplier(supplier.get(), language, getTranslatedReason(rejectSupplier.getReason(), language));
        } catch (DataIntegrityViolationException exception) {
            throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
        }
    }

    @Transactional
    public void approveSupplier(UUID supplierId, String language) throws DtoValidateException {
        Optional<Supplier> supplier = findBySupplierId(supplierId);

        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        enforceAdminTenantOwnership(supplier.get());

        updateSupplierStatus(supplier.get(), SupplierStatusEnum.APPROVED);

        saveQRCode(supplier.get());
        sendReviewEmailToSupplier(supplier.get(), SupplierStatusEnum.APPROVED, language);
    }

    @Transactional(rollbackFor = Exception.class)
    public void finalizeSupplier(SupplierRequestPatchDto request, String language) throws DtoValidateException, UnauthorizedActionException {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        User supplierUser = userService.findByUsername(supplier.getAdminEmail())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        boolean isProfileNew = !supplier.getIsProfileSet();

        if (supplier.getStatus() == SupplierStatusEnum.APPROVED) {
            throw new DtoValidateException(errorEntityValidate);
        }

        if (!isAdminAuthorizedToEditSupplier(supplier)) {
            throw new UnauthorizedActionException(errorUnauthorizedAction);
        }

        if (!isKvkValid(request.kvkNumber()) || !isZipCodeValid(request.profile().branchZip())
                || isKvkUsedByAnotherSupplier(request.kvkNumber(), request.supplierId())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        SupplierRequestPatchDto before = SupplierRequestPatchDto.getSupplierProfilePatchDtoFromEntities(supplier);

        updateUserData(supplierUser, request);
        updateSupplierProfileData(supplier, request);
        updateSupplierData(supplier, request);

        CashierEmailResultDto cashierEmailResultDto = supplierProfileService.getCashierEmailResultDto(request.profile().cashierEmails(), supplier.getId());

        if (!cashierEmailResultDto.newEmails().isEmpty()) {
            supplierProfileService.addCashiers(cashierEmailResultDto.newEmails(), supplier, language);
        }

        /* Uncomment this code to enable deletion of cashier
        if (!cashierEmailResultDto.deletedEmails().isEmpty()) {
            userService.deleteCashierUsers(supplier, cashierEmailResultDto.deletedEmails());
        }*/

        List<String> changes = computeSupplierChanges(before, request, cashierEmailResultDto, isProfileNew);

        saveQRCode(supplier);
        sendProfileApprovedWithChangesEmail(supplier, language, changes, isProfileNew);
    }

    @Transactional(rollbackFor = Exception.class)
    public void save(RegisterSupplierDto registerSupplierDto, Optional<Tenant> tenant, String language)
            throws DtoValidateException {

        if (!registerSupplierDto.agreedTerms()) {
            throw new DtoValidateException(errorTermsNotAgreed);
        }

        if (!isKvkValid(registerSupplierDto.kvk()) || isKvkUsed(registerSupplierDto.kvk())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Optional<User> user = userService.findByUsername(registerSupplierDto.email());

        if (user.isPresent()) {
            throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
        }

        Supplier supplier = supplierRepository.save(ModelConverter.registerSupplierToEntity(registerSupplierDto, tenant.get()));

        RegisterUserDto registerUserDto = ModelConverter.registerSupplierDtoToRegisterUserDto(registerSupplierDto);

        String token = userService.saveForSupplier(registerUserDto, supplier);
        sendConfirmationEmail(supplier.getCompanyName(), registerSupplierDto.email(), token, language);
    }

    public List<SupplierViewDto> getAllByTenantIdAndStatus(UUID tenantId, int page, int size, SupplierStatusEnum status)
            throws DtoValidateException {
        enforceAdminTenantIdOwnership(tenantId);

        Optional<Tenant> tenant = tenantRepository.findById(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        Page<Supplier> suppliers = supplierRepository.findAllByTenantIdAndStatus(tenantId, pageable, status);
        return suppliers.stream().map(SupplierViewDto::entityToSupplierViewDto).toList();
    }

    public List<SupplierForMapViewDto> getAllByTenantIdForMap(UUID tenantId) throws DtoValidateNotFoundException {
        enforceAdminTenantIdOwnership(tenantId);

        Optional<Tenant> tenant = tenantRepository.findById(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        List<Supplier> suppliers = supplierRepository.findAllByTenantIdAndStatus(tenantId, SupplierStatusEnum.APPROVED);
        return suppliers.stream().map(SupplierForMapViewDto::entityToSupplierForMapViewDto).toList();
    }

    public List<SupplierViewDto> getAllByTenantIdAndStatusIn(UUID tenantId, int page, int size, Set<SupplierStatusEnum> status) throws DtoValidateException {
        enforceAdminTenantIdOwnership(tenantId);

        Optional<Tenant> tenant = tenantRepository.findById(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));

        Page<Supplier> suppliers = supplierRepository.findAllByTenantIdAndStatusInOrderByCreatedDateDesc(tenantId, pageable, status);
        return suppliers.stream().map(SupplierViewDto::entityToSupplierViewDto).toList();
    }

    public RejectSupplierDto getRejectedSupplier(UUID supplierId) throws DtoValidateException {
        User user = principalService.getUser();

        if (user.getSupplier() == null || !supplierId.equals(user.getSupplier().getId())) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Optional<RejectSupplier> rejectedSupplier = findRejectedSupplier(supplierId);

        if (rejectedSupplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        return ModelConverter.entityToRejectSupplierDto(rejectedSupplier.get());
    }

    public Integer countAllByTenantIdAndStatus(UUID tenantId, Set<SupplierStatusEnum> statuses)
            throws DtoValidateNotFoundException {
        enforceAdminTenantIdOwnership(tenantId);

        Optional<Tenant> tenant = tenantRepository.findById(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return supplierRepository.countByTenantIdAndStatusIn(tenantId, statuses);
    }

    public void sendReviewEmailToSupplier(Supplier supplier, SupplierStatusEnum status, String language) {

        String url = baseURL + "/login";
        List<User> supplierUsers = userService.findAllSuppliersBySupplierId(supplier.getId());

        String[] emailsArray = supplierUsers.stream().map(User::getUsername).toArray(String[]::new);

        if (status == SupplierStatusEnum.APPROVED) {
            emailService.sendApproveProfileEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), supplier.getCompanyName(),
                    supplier.getTenant().getName());
        }
    }

    public void sendProfileApprovedWithChangesEmail(Supplier supplier, String language, List<String> changes, boolean isProfileNew) {
        String url = baseURL + "/login";
        List<User> supplierUsers = userService.findAllSuppliersBySupplierId(supplier.getId());

        String[] emailsArray = supplierUsers.stream().map(User::getUsername).toArray(String[]::new);
        emailService.sendProfileApprovedWithChangesEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), supplier.getCompanyName(),
                supplier.getTenant().getName(), changes, isProfileNew);
    }

    public void sendRejectEmailToSupplier(Supplier supplier, String language, String reason) {

        String url = baseURL + "/login";
        List<User> supplierUsers = userService.findAllSuppliersBySupplierId(supplier.getId());

        Optional<Tenant> tenant = tenantRepository.findById(supplierUsers.get(0).getTenantId());

        String[] emailsArray = supplierUsers.stream().map(User::getUsername).toArray(String[]::new);
        emailService.sendRejectSupplierEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), supplier.getCompanyName(),
                tenant.get().getName(), reason);

    }

    @Transactional
    public void updateSupplierStatus(Supplier supplier, SupplierStatusEnum status) {
        supplier.setStatusUpdate(StatusUpdateEnum.SIMPLE);
        if (status == SupplierStatusEnum.APPROVED) {
            supplier.setIsReviewed(true);
        }
        supplier.setStatus(status);
        supplierRepository.save(supplier);
    }

    @Transactional
    public void updateSupplierHasStatusUpdate(UUID supplierId, StatusUpdateEnum value) {
        supplierRepository.updateSupplierHasStatusUpdate(supplierId, value);
    }

    @Transactional
    public void clearStatusUpdate(UUID supplierId) throws DtoValidateNotFoundException {
        User user = principalService.getUser();

        if (user.getSupplier() == null || !supplierId.equals(user.getSupplier().getId())) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Optional<Supplier> supplier = findBySupplierId(supplierId);
        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        supplierRepository.clearSupplierStatusUpdate(supplierId);
    }

    public SupplierProfileResult getSupplierProfile(UUID supplierId) throws NotFoundException {
        Optional<User> user = userRepository.findBySupplierIdAndRole_Name(supplierId, Role.ROLE_SUPPLIER);

        if(user.isEmpty()) {
            throw new NotFoundException(errorEntityNotFound);
        }

        Supplier supplier = getSupplierWithProfile(supplierId);

        if (supplier.getProfile() == null) {
            String ownerName = user.get().getFirstName() + " " + user.get().getLastName();
            return SupplierProfileIncompleteViewDto.entityToSupplierProfileIncompleteViewDto(supplier, ownerName);
        }

        return SupplierProfileViewDto.entityToSupplierProfileViewDto(supplier);
    }

    public Supplier getSupplierWithProfile(UUID supplierId) throws NotFoundException {
        User currentUser = getCurrentUser();
        Supplier supplier = supplierRepository.findWithSupplierProfileById(supplierId)
                .orElseThrow(() -> new NotFoundException(errorEntityNotFound));

        boolean isSupplier = Role.ROLE_SUPPLIER.equals(currentUser.getRole().getName());
        boolean isAdmin = Role.ROLE_SUPER_ADMIN.equals(currentUser.getRole().getName())
                || Role.ROLE_MUNICIPALITY_ADMIN.equals(currentUser.getRole().getName());

        if (isSupplier && !Objects.equals(supplier.getId(), currentUser.getSupplier().getId())) {
            throw new UnauthorizedActionException(errorUnauthorizedAction);
        }

        if (isAdmin && !Objects.equals(supplier.getTenant().getId(), currentUser.getTenantId())) {
            throw new UnauthorizedActionException(errorUnauthorizedAction);
        }

        return supplier;
    }

    public byte[] getQRImage() throws IOException {

        User user = principalService.getUser();
        String key = String.valueOf(user.getSupplier().getId());

        S3Object s3Object = amazonS3Client.getObject(new GetObjectRequest(s3BucketName, key));
        byte[] imageBytes = IOUtils.toByteArray(s3Object.getObjectContent());
        s3Object.close();
        return imageBytes;

    }

    public void validateSupplier(UUID supplierId) throws DtoValidateException {
        User user = principalService.getUser();
        String roleName = user.getRole().getName();

        Supplier supplier = supplierRepository.findWithSupplierProfileById(supplierId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        if (Role.ROLE_SUPPLIER.equals(roleName)) {
            if (user.getSupplier() == null || !supplierId.equals(user.getSupplier().getId())) {
                throw new DtoValidateNotFoundException(errorEntityNotFound);
            }
        } else if (Role.ROLE_MUNICIPALITY_ADMIN.equals(roleName) || Role.ROLE_SUPER_ADMIN.equals(roleName)) {
            if (supplier.getTenant() == null || !supplier.getTenant().getId().equals(user.getTenantId())) {
                throw new DtoValidateNotFoundException(errorEntityNotFound);
            }
        }
    }


    private List<String> computeSupplierChanges(SupplierRequestPatchDto before, SupplierRequestPatchDto after, CashierEmailResultDto cashiers, boolean ignoreProfile) {
        Set<String> accountChanges = Set.of("companyName", "kvkNumber", "adminEmail");
        Set<String> workingHoursFields = Set.of(
                "openTime",
                "closeTime",
                "day"
        );

        Diff diff = javers.compare(before, after);
        List<String> changes = diff.getChanges().stream()
                .filter(PropertyChange.class::isInstance)
                .map(PropertyChange.class::cast)
                .map(PropertyChange::getPropertyName)
                .filter(change -> !ignoreProfile || accountChanges.contains(change))
                .collect(Collectors.toCollection(ArrayList::new));

        boolean hasWorkingHoursChange = changes.removeIf(workingHoursFields::contains);

        if (hasWorkingHoursChange) {
            changes.add("workingHours");
        }

        if (!cashiers.newEmails().isEmpty() || !cashiers.deletedEmails().isEmpty()) {
            changes.add("cashierEmails");
        }

        return changes;
    }

    private void saveQRCode(Supplier supplier) throws DtoValidateException {
        try {
            // BufferedImage qrCodeImage = qrCodeGenerator.generateQRCodeImage("https://www.google.com/");
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            // ImageIO.write(qrCodeImage, "png", os);
            InputStream is = new ByteArrayInputStream(os.toByteArray());

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(os.size());
            metadata.setContentType("image/png");

            amazonS3Client.putObject(new PutObjectRequest(s3BucketName, String.valueOf(supplier.getId()), is, metadata));
        } catch (Exception exception) {
            throw new DtoValidateException(errorEntityValidate);
        }

    }

    private void updateUserData(User supplierUser, SupplierRequestPatchDto request) {
        if (!supplierUser.getUsername().equals(request.adminEmail())) {
            supplierUser.setUsername(request.adminEmail());
        }

        supplierUser.setIsEnabled(true);
        supplierUser.setApproved(true);
        userService.save(supplierUser);
    }

    private void updateSupplierData(Supplier supplier, SupplierRequestPatchDto request) {
        supplier.setCompanyName(request.companyName());
        supplier.setKvk(request.kvkNumber());
        supplier.setAdminEmail(request.adminEmail());

        supplier.setStatus(SupplierStatusEnum.APPROVED);
        supplier.setStatusUpdate(StatusUpdateEnum.WITH_CHANGES);
        supplier.setIsReviewed(true);
        supplierRepository.save(supplier);
    }

    private void updateSupplierProfileData(Supplier supplier, SupplierRequestPatchDto request) throws DtoValidateException {
        if (supplier.getIsProfileSet()) {
            workingHoursService.validateWorkWeek(request.workingHours());

            supplierProfileService.saveUpdatedData(supplier, request.profile());
            workingHoursService.editAll(request.workingHours(), supplier);
        } else {
            supplierProfileService.createAndSetProfileAsAdmin(supplier, request.profile());

            List<WorkingHours> workingHours = workingHoursService.createWorkingHoursAsAdmin(request.workingHours(), supplier);
            supplier.setWorkingHours(workingHours);
            supplier.setIsProfileSet(true);
        }

    }

    private void sendConfirmationEmail(String companyName, String email, String token, String language) {
        String url = backendBaseUrl + "/users/confirm-account/" + token;
        emailService.sendConfirmAccountEmail(url, StringUtils.getLanguageForLocale(language), companyName, email);
    }

    private boolean isAdminAuthorizedToEditSupplier(Supplier supplier) {
        User user = getCurrentUser();
        return user.getRole().getName().equals(Role.ROLE_SUPER_ADMIN) && Objects.equals(user.getTenantId(), supplier.getTenant().getId());
    }

    private void enforceAdminTenantOwnership(Supplier supplier) throws DtoValidateNotFoundException {
        if (supplier.getTenant() == null || !Objects.equals(supplier.getTenant().getId(), principalService.getTenantId())) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
    }

    private void enforceAdminTenantIdOwnership(UUID requestedTenantId) throws DtoValidateNotFoundException {
        if (!requestedTenantId.equals(principalService.getTenantId())) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
    }

    private User getCurrentUser() {
        return principalService.getUser();
    }

    private boolean isKvkUsedByAnotherSupplier(String kvk, UUID supplierId) {
        return supplierRepository.existsByKvkAndIdNot(kvk, supplierId);
    }

    private boolean isKvkUsed(String kvk) {
        return supplierRepository.existsByKvk(kvk);
    }

    public String getTranslatedReason(RejectionReason reason, String language) {
        Locale locale = Locale.forLanguageTag(language);
        return messageSource.getMessage(reason.getReason(), null, locale);
    }
}

