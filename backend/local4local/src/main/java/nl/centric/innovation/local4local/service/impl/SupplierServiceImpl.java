package nl.centric.innovation.local4local.service.impl;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.util.IOUtils;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RegisterUserDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.SupplierForMapViewDto;
import nl.centric.innovation.local4local.dto.SupplierViewDto;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.repository.RejectSupplierRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.ModelConverter;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.util.Validators.isKvkValid;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class SupplierServiceImpl implements SupplierService {
    public static final String ORDER_CRITERIA = "companyName";

    private final RejectSupplierRepository rejectSupplierRepository;

    private final SupplierRepository supplierRepository;

    private final TenantService tenantService;

    private final UserService userService;

    private final EmailService emailService;

    private final AmazonS3 amazonS3Client;

    private final PrincipalService principalService;

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

    @Override
    public Optional<Supplier> findBySupplierId(UUID supplierId) {
        return supplierRepository.findWithSupplierProfileById(supplierId);
    }

    @Override
    public Optional<RejectSupplier> findRejectedSupplier(UUID supplierId) {
        return rejectSupplierRepository.findBySupplierId(supplierId);
    }

    @Override
    public void rejectSupplier(RejectSupplierDto rejectSupplierDto, String language, String reason)
            throws DtoValidateException, DataIntegrityViolationException {
        try {
            Optional<Supplier> supplier = findBySupplierId(rejectSupplierDto.supplierId());

            if (supplier.isEmpty()) {
                throw new DtoValidateNotFoundException(errorEntityNotFound);
            }

            RejectSupplier rejectSupplier = ModelConverter.rejectSupplierToEntity(rejectSupplierDto, supplier.get());

            rejectSupplierRepository.save(rejectSupplier);
            updateSupplierStatus(supplier.get(), SupplierStatusEnum.REJECTED);
            sendRejectEmailToSupplier(supplier.get(), language, reason);
        } catch (DataIntegrityViolationException exception) {
            throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
        }
    }

    @Override
    @Transactional
    public void approveSupplier(UUID supplierId, String language) throws DtoValidateException {
        Optional<Supplier> supplier = findBySupplierId(supplierId);

        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        updateSupplierStatus(supplier.get(), SupplierStatusEnum.APPROVED);

        sendReviewEmailToSupplier(supplier.get(), SupplierStatusEnum.APPROVED, language);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void save(RegisterSupplierDto registerSupplierDto, Optional<Tenant> tenant, String language)
            throws DtoValidateException {

        if (!registerSupplierDto.agreedTerms()) {
            throw new DtoValidateException(errorTermsNotAgreed);
        }

        if (!isKvkValid(registerSupplierDto.kvk())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Optional<User> user = userService.findByUsername(registerSupplierDto.email());

        if (user.isPresent()) {
            throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
        }

        Supplier supplier = supplierRepository
                .save(ModelConverter.registerSupplierToEntity(registerSupplierDto, tenant.get()));

        RegisterUserDto registerUserDto = ModelConverter.registerSupplierDtoToRegisterUserDto(registerSupplierDto);

        String token = userService.saveForSupplier(registerUserDto, supplier);
        sendConfirmationEmail(supplier.getCompanyName(), registerSupplierDto.email(), token, language);
    }

    @Override
    public List<SupplierViewDto> getAllByTenantIdAndStatus(UUID tenantId, int page, int size, SupplierStatusEnum status)
            throws DtoValidateNotFoundException {
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        Page<Supplier> suppliers = supplierRepository.findAllByTenantIdAndStatus(tenantId, pageable, status);
        return suppliers.stream().map(SupplierViewDto::entityToSupplierViewDto).collect(Collectors.toList());
    }

    @Override
    public List<SupplierForMapViewDto> getAllByTenantIdForMap(UUID tenantId) throws DtoValidateNotFoundException {
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        List<Supplier> suppliers = supplierRepository.findAllByTenantIdAndStatus(tenantId, SupplierStatusEnum.APPROVED);
        return suppliers.stream().map(ModelConverter::entityToSupplierForMapViewDto).collect(Collectors.toList());
    }

    @Override
    public List<SupplierViewDto> getAllByTenantIdAndStatusIn(UUID tenantId, int page, int size, Set<SupplierStatusEnum> status) throws DtoValidateException {
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));

        Page<Supplier> suppliers = supplierRepository.findAllByTenantIdAndStatusIn(tenantId, pageable, status);
        return suppliers.stream().map(SupplierViewDto::entityToSupplierViewDto).collect(Collectors.toList());
    }

    @Override
    public RejectSupplierDto getRejectedSupplier(UUID supplierId) throws DtoValidateException {
        Optional<RejectSupplier> rejectedSupplier = findRejectedSupplier(supplierId);

        if (rejectedSupplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        return ModelConverter.entityToRejectSupplierDto(rejectedSupplier.get());
    }

    @Override
    public Integer countAllByTenantIdAndStatus(UUID tenantId, Set<SupplierStatusEnum> statuses)
            throws DtoValidateNotFoundException {
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return supplierRepository.countByTenantIdAndStatusIn(tenantId, statuses);
    }

    @Override
    public void sendReviewEmailToSupplier(Supplier supplier, SupplierStatusEnum status, String language) {

        String url = baseURL + "/login";
        List<User> supplierUsers = userService.findAllBySupplierId(supplier.getId());

        String[] emailsArray = supplierUsers.stream().map(User::getUsername).toArray(String[]::new);
        if (status == SupplierStatusEnum.APPROVED) {
            emailService.sendApproveProfileEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), supplier.getCompanyName(),
                    supplier.getTenant().getName());
        }
    }

    @Override
    public void sendRejectEmailToSupplier(Supplier supplier, String language, String reason) {

        String url = baseURL + "/login";
        List<User> supplierUsers = userService.findAllBySupplierId(supplier.getId());

        Optional<Tenant> tenant = tenantService.findByTenantId(supplierUsers.get(0).getTenantId());

        String[] emailsArray = supplierUsers.stream().map(User::getUsername).toArray(String[]::new);
        emailService.sendRejectSupplierEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), supplier.getCompanyName(),
                tenant.get().getName(), reason);

    }

    @Transactional
    @Override
    public void updateSupplierStatus(Supplier supplier, SupplierStatusEnum status) {
        supplier.setHasStatusUpdate(true);
        if (status == SupplierStatusEnum.APPROVED) {
            supplier.setIsReviewed(true);
        }
        supplier.setStatus(status);
        supplierRepository.save(supplier);
    }

    @Transactional
    @Override
    public void updateSupplierHasStatusUpdate(UUID supplierId, boolean value) {
        supplierRepository.updateSupplierHasStatusUpdate(supplierId, value);
    }

    @Override
    public Supplier getSupplierWithProfile(UUID supplierId) throws NotFoundException {
        return supplierRepository.findWithSupplierProfileById(supplierId)
                .orElseThrow(() -> new NotFoundException("error.entity.notfound"));
    }

    private void sendConfirmationEmail(String companyName, String email, String token, String language) {
        String url = backendBaseUrl + "/users/confirm-account/" + token;
        emailService.sendConfirmAccountEmail(url, StringUtils.getLanguageForLocale(language), companyName, email);
    }

}
