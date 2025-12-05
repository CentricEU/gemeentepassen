package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.entity.*;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.L4LException;
import nl.centric.innovation.local4local.repository.SupplierProfileRepository;
import nl.centric.innovation.local4local.repository.SupplierRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.SupplierProfileService;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;
import nl.centric.innovation.local4local.util.MapUtils;
import nl.centric.innovation.local4local.util.ModelConverter;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.Validators.isImageSizeValid;
import static nl.centric.innovation.local4local.util.Validators.isKvkValid;
import static nl.centric.innovation.local4local.util.Validators.isTelephoneValid;
import static nl.centric.innovation.local4local.util.Validators.isZipCodeValid;

@Service
@RequiredArgsConstructor
public class SupplierProfileServiceImpl implements SupplierProfileService {

    private final SupplierRepository supplierRepository;

    private final SupplierProfileRepository supplierProfileRepository;

    private final SupplierService supplierService;

    private final UserService userService;

    private final TenantService tenantService;

    private final WorkingHoursService workingHoursService;

    private final EmailService emailService;

    @Value("${local4local.municipality.server.name}")
    private String baseURL;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

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

    @Override
    @Transactional(rollbackFor = DtoValidateException.class)
    public SupplierProfileDto save(SupplierProfileDto supplierProfileDto) throws DtoValidateException {
        try {
            this.checkErrorEntityValidate(supplierProfileDto);

            if (!isImageSizeValid(200, supplierProfileDto.logo())) {
                throw new DtoValidateException(errorSizeExceeded);
            }

            Optional<Supplier> supplier = supplierService.findBySupplierId(supplierProfileDto.supplierId());

            if (supplier.isEmpty()) {
                throw new DtoValidateNotFoundException(errorEntityNotFound);
            }

            if (supplier.get().getProfile() != null) {
                throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
            }
            List<WorkingHours> workingHours = workingHoursService.createWorkingHours(supplierProfileDto.workingHours(),
                    supplier.get());

            SupplierProfile supplierProfile = ModelConverter.supplierProfileToEntity(supplierProfileDto);
            MapUtils.setCoordonates(supplierProfile, supplierProfileDto.latlon());

            if (supplierProfileDto.subcategory() == null) {
                supplierProfile.setSubcategory(null);
            }

            SupplierProfile supplierProfileResponse = supplierProfileRepository.save(supplierProfile);
            supplierRepository.updateSupplierByIsProfileSet(SupplierStatusEnum.PENDING, supplier.get().getId());
            supplierRepository.updateSupplierProfile(supplier.get().getId(), supplierProfileResponse.getId());
            supplier.get().setWorkingHours(workingHours);
            supplierRepository.save(supplier.get());

            return supplierProfileDto;
        } catch (DataIntegrityViolationException | L4LException exception) {
            throw new DtoValidateException(dataIntegrityViolation);
        }
    }

    public void sendProfileSetupEmailToAllAdmins(UUID tenantId, SupplierProfileDto supplierProfileDto, String language)
            throws DtoValidateNotFoundException {
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        String tenantName = tenant.get().getName();

        List<User> adminList = userService.findAllAdminsByTenantId(tenantId);

        String url = baseURL + "/suppliers";

        String[] emailsArray = adminList.stream().map(User::getUsername).toArray(String[]::new);
        emailService.sendProfileCreatedEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), tenantName, supplierProfileDto.companyName(),
                supplierProfileDto.accountManager());
    }

    @Override
    public void updateSupplierProfile(SupplierProfileDto supplierProfileDto) throws DtoValidateException {
        this.checkErrorEntityValidate(supplierProfileDto);

        if (!isImageSizeValid(200, supplierProfileDto.logo())) {
            throw new DtoValidateException(errorSizeExceeded);
        }

        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierProfileDto.supplierId());

        if (supplier.isEmpty() || supplier.get().getProfile() == null) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        saveUpdatedData(supplier.get(), supplierProfileDto);
    }

    private void checkErrorEntityValidate(SupplierProfileDto supplierProfileDto) throws DtoValidateException {

        boolean shouldThrowErrorEntity = !isKvkValid(supplierProfileDto.kvkNumber())
                || !isZipCodeValid(supplierProfileDto.branchZip())
                || !isTelephoneValid(supplierProfileDto.branchTelephone());

        if (shouldThrowErrorEntity) {
            throw new DtoValidateException(errorEntityValidate);
        }
    }

    private void saveUpdatedData(Supplier supplier, SupplierProfileDto supplierProfileDto) throws DtoValidateException {
        try {
            SupplierProfile supplierProfile = ModelConverter.supplierProfileToEntity(supplierProfileDto);
            MapUtils.setCoordonates(supplierProfile, supplierProfileDto.latlon());

            supplierProfile.setId(supplier.getProfile().getId());

            supplier.setKvk(supplierProfileDto.kvkNumber());
            supplier.setCompanyName(supplierProfileDto.companyName());
            supplier.setAdminEmail(supplierProfileDto.adminEmail());

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
