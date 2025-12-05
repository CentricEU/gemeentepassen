package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.DeleteOffersDto;
import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferMobileDetailDto;
import nl.centric.innovation.local4local.dto.OfferMobileListDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightDto;
import nl.centric.innovation.local4local.dto.OfferRejectionReasonDto;
import nl.centric.innovation.local4local.dto.OfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferDto;
import nl.centric.innovation.local4local.dto.OfferStatusCountsDto;
import nl.centric.innovation.local4local.dto.OfferUsageRequestDto;
import nl.centric.innovation.local4local.dto.OfferViewDto;
import nl.centric.innovation.local4local.dto.OfferViewTableDto;
import nl.centric.innovation.local4local.dto.ReactivateOfferDto;
import nl.centric.innovation.local4local.dto.RejectOfferDto;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.entity.RejectOffer;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.repository.RejectOfferRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.RestrictionService;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.DateUtils;
import nl.centric.innovation.local4local.util.ModelConverter;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.entity.Offer.offerRequestDtoToEntity;
import static nl.centric.innovation.local4local.util.CommonUtils.getBaseUrl;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class OfferService {

    public static final String ORDER_CRITERIA = "title";

    private final GrantService grantService;

    private final OfferRepository offerRepository;

    private final PrincipalService principalService;

    private final SupplierService supplierService;

    private final EmailService emailService;

    private final TenantService tenantService;

    private final UserService userService;

    private final RestrictionService restrictionService;

    private final OfferTypeRepository offerTypeRepository;

    private final DiscountCodeRepository discountCodeRepository;

    private final RejectOfferRepository rejectOfferRepository;

    private final DiscountCodeService discountCodeService;

    private static final Set<Integer> AMOUNT_REQUIRED_OFFER_TYPES = Set.of(1, 3, 4);


    @Value("${error.general.availability}")
    private String errorGeneralAvailability;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.size.exceeded}")
    private String sizeExceeded;

    @Value("${error.date.outOfRange}")
    private String dateOutOfRange;

    @Value("${local4local.server.name}")
    private String baseUrl;

    @Value("${local4local.municipality.server.name}")
    private String baseMunicipalityUrl;

    @Transactional
    public void useOffer(OfferUsageRequestDto offerUsageRequestDto) throws DtoValidateException {
        UUID citizenId = getCurrentUser().getId();

        Offer offer = offerRepository.findByIdAndStatus(offerUsageRequestDto.offerId(), GenericStatusEnum.ACTIVE)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        if (offer.getAmount() != null && offerUsageRequestDto.amount() > offer.getAmount()) {
            throw new DtoValidateException(sizeExceeded);
        }

        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime offerStartDateTime = offer.getStartDate().atStartOfDay();
        LocalDateTime offerEndDateTime = offer.getExpirationDate().atTime(LocalTime.MAX);

        if (currentDateTime.isBefore(offerStartDateTime) || currentDateTime.isAfter(offerEndDateTime)) {
            throw new DtoValidateException(dateOutOfRange);
        }

        discountCodeService.save(offer.getId(), citizenId);
    }

    public OfferViewDto createOffer(OfferRequestDto offerRequestDto, String language) throws DtoValidateException {
        OfferType offerType = validateOfferRequest(offerRequestDto);

        Restriction restriction = handleRestriction(offerRequestDto);
        Offer savedOffer = saveOffer(offerRequestDto, restriction, offerType);

        sendReviewOfferEmail(getTenantId(), language, getCurrentUser());

        return ModelConverter.entityToOfferViewDto(savedOffer);
    }

    public List<OfferViewTableDto> getAll(Integer page, Integer size) {
        UUID supplierId = principalService.getSupplierId();

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        Page<Offer> offers = offerRepository.findAllBySupplierIdAndIsActive(supplierId, true, pageable);
        return offers.stream()
                .map(offer -> ModelConverter.entityToOfferViewTableDto(offer,
                        offer.getGrants() != null ? ModelConverter.grantToGrantViewDto(offer.getGrants()) : null))
                .toList();
    }

    public List<OfferViewTableDto> getAllForTenantPaginated(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        List<GenericStatusEnum> statusList = Arrays.asList(GenericStatusEnum.PENDING, GenericStatusEnum.REJECTED);

        Page<Offer> offers = offerRepository.findAllBySupplierTenantIdAndIsActiveTrueAndStatusIn(getTenantId(), pageable, statusList);
        return offers.stream()
                .map(offer -> ModelConverter.entityToOfferViewTableDto(offer,
                        offer.getGrants() != null ? ModelConverter.grantToGrantViewDto(offer.getGrants()) : null))
                .toList();
    }

    public List<OfferViewTableDto> getAllBySupplierIdPaginated(Integer page, Integer size, UUID supplierId) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));

        Page<Offer> offers = offerRepository.findAllBySupplierIdAndIsActive(supplierId, true, pageable);
        return offers.stream()
                .map(offer -> ModelConverter.entityToOfferViewTableDto(offer,
                        offer.getGrants() != null ? ModelConverter.grantToGrantViewDto(offer.getGrants()) : null))
                .toList();
    }

    public Map<String, List<OfferMobileMapLightDto>> getOffersWithinViewport(Double minLatitude, Double maxLatitude,
                                                                             Double minLongitude, Double maxLongitude,
                                                                             LocalDate currentDay,
                                                                             Integer offerType) {

        List<OfferMobileMapLightDto> offers = offerRepository.findActiveOffersInViewport(minLatitude, maxLatitude, minLongitude, maxLongitude, currentDay, getTenantId(), offerType);
        return offers.stream()
                .collect(Collectors.groupingBy(OfferMobileMapLightDto::coordinatesString));
    }

    public Integer countAll() {
        UUID supplierId = principalService.getSupplierId();
        return offerRepository.countBySupplierIdAndIsActiveTrue(supplierId);
    }

    public Integer countAllForTenantId() {
        List<GenericStatusEnum> statusList = Arrays.asList(GenericStatusEnum.PENDING, GenericStatusEnum.REJECTED);
        return offerRepository.countBySupplierTenantIdAndIsActiveTrueAndStatusIn(getTenantId(), statusList);
    }

    public Integer countAllBySupplierId(UUID supplierId) {
        return offerRepository.countBySupplierIdAndIsActiveTrue(supplierId);
    }

    public Integer countFilteredOffers(FilterOfferRequestDto filterParams) {
        UUID supplierId = principalService.getSupplierId();
        return offerRepository.countWithSpecification(supplierId, filterParams);
    }

    public void sendReviewOfferEmail(UUID tenantId, String language, User user) throws DtoValidateNotFoundException {
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        String tenantName = tenant.get().getName();

        List<User> adminList = userService.findAllAdminsByTenantId(tenantId);

        String url = getBaseUrl(false, baseUrl, baseMunicipalityUrl) + "/offers";

        String[] emailsArray = adminList.stream().map(User::getUsername).toArray(String[]::new);
        String fullName = String.format("%s %s", user.getFirstName(), user.getLastName());
        String languageLocale = StringUtils.getLanguageForLocale(language);
        String companyName = user.getSupplier().getCompanyName();

        emailService.sendOfferReviewEmail(url, emailsArray, languageLocale, tenantName, companyName, fullName);
    }

    @Transactional
    public void approveOffer(UUID offerId, String language) throws DtoValidateException {
        Optional<Offer> offer = offerRepository.findById(offerId);

        if (offer.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        UUID supplierId = offer.get().getSupplier().getId();
        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierId);

        updateOfferStatus(offer.get(), GenericStatusEnum.ACTIVE);
        sendOfferApprovedEmailToSupplier(supplier.get(), language);
    }

    @Transactional
    public void updateOfferStatus(Offer offer, GenericStatusEnum status) {
        offer.setStatus(status);
        offerRepository.save(offer);
    }

    public List<OfferMobileListDto> getOffersOrderedByDistanceToUser(Integer page, Double latitude, Double longitude, LocalDate currentDay) throws DtoValidateException {
        if (Double.isNaN(latitude) || Double.isNaN(longitude)) {
            throw new DtoValidateException(errorEntityValidate);
        }

        Pageable pageable = PageRequest.of(page, 20);
        return offerRepository.findAllOffersOrderedByDistanceToUser(pageable, latitude, longitude, principalService.getTenantId(), currentDay);
    }

    //TODO to refactor this method
    @Transactional
    public OfferMobileDetailDto getOfferDetails(UUID offerId, Double latitude, Double longitude, LocalDate currentDay) throws DtoValidateNotFoundException {
        Optional<Offer> offer = offerRepository.findById(offerId);

        if (offer.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Double distance = offerRepository.getOfferDistance(offerId, latitude, longitude);

        UUID citizenId = getCurrentUser().getId();
        String discountCode = discountCodeRepository.findByUserIdAndOfferId(citizenId, offerId)
                .map(DiscountCode::getCode)
                .orElse(null);

        boolean isActive = offer.get().getStartDate().isBefore(currentDay) || offer.get().getStartDate().isEqual(currentDay);
        return OfferMobileDetailDto.entityToOfferMobileDetailDto(offer.get(), distance, discountCode, isActive);
    }

    public void deleteOffers(DeleteOffersDto deleteOffersDto) {
        List<Offer> offers = offerRepository.findAllById(deleteOffersDto.offersIds());

        offers.forEach(offer -> offer.setActive(false));

        offerRepository.saveAll(offers);
    }

    public Offer reactivateOffer(ReactivateOfferDto reactivateOfferDto) throws DtoValidateNotFoundException {
        if (reactivateOfferDto.expirationDate().isBefore(reactivateOfferDto.startDate())) {
            throw new DtoValidateNotFoundException(errorGeneralAvailability);
        }

        Offer offerToReactivate = offerRepository.findById(reactivateOfferDto.offerId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        offerToReactivate.setStartDate(reactivateOfferDto.startDate());
        offerToReactivate.setExpirationDate(reactivateOfferDto.expirationDate());
        offerToReactivate.setCreatedDate(LocalDateTime.now());

        offerToReactivate.setStatus(offerToReactivate.getOfferType().getOfferTypeId() == 0 ?
                GenericStatusEnum.PENDING :
                GenericStatusEnum.ACTIVE);

        offerRepository.save(offerToReactivate);
        return offerToReactivate;
    }

    public List<OfferViewTableDto> getFilteredOffers(FilterOfferRequestDto filterParams, Integer pageIndex, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageIndex, pageSize);
        List<Offer> offers = offerRepository.findAllWithSpecification(principalService.getSupplierId(), filterParams, pageable);

        return offers.stream()
                .map(offer -> ModelConverter.entityToOfferViewTableDto(offer,
                        offer.getGrants() != null ? ModelConverter.grantToGrantViewDto(offer.getGrants()) : null))
                .toList();
    }

    public OfferDto getFullOffer(UUID offerId) throws DtoValidateNotFoundException {
        Optional<Offer> offer = offerRepository.findById(offerId);

        if (offer.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return OfferDto.entityToOfferDto(offer.get());
    }

    public void rejectOffer(RejectOfferDto rejectOfferDto, String language) throws DtoValidateException {
        Optional<Offer> offer = offerRepository.findById(rejectOfferDto.offerId());

        if (offer.isEmpty()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        if (!offer.get().getStatus().equals(GenericStatusEnum.PENDING)) {
            throw new DtoValidateException(errorEntityValidate);
        }

        RejectOffer rejectedOffer = RejectOffer.rejectOfferDtoToEntity(rejectOfferDto);
        rejectOfferRepository.save(rejectedOffer);

        updateOfferStatus(offer.get(), GenericStatusEnum.REJECTED);

        UUID supplierId = offer.get().getSupplier().getId();
        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierId);

        sendOfferRejectedEmailToSupplier(supplier.get(), rejectOfferDto, language);
    }

    public OfferRejectionReasonDto getOfferRejectionReason(UUID offerId) throws DtoValidateException {
        Optional<Offer> offer = offerRepository.findById(offerId);

        if (offer.isEmpty()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        if (!offer.get().getSupplier().getId().equals(principalService.getSupplierId())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        if (!offer.get().getStatus().equals(GenericStatusEnum.REJECTED) || !offer.get().isActive()) {
            throw new DtoValidateException(errorEntityValidate);
        }

        Optional<RejectOffer> rejectedOffer = rejectOfferRepository.findByOfferId(offerId);

        if (rejectedOffer.isEmpty()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        return OfferRejectionReasonDto.entityToOfferRejectionReasonDto(rejectedOffer.get(), offer.get().getTitle());
    }

    public OfferStatusCountsDto getOfferCountsByStatus(UUID supplierId, TimeIntervalPeriod period) {
        LocalDateTime createdDate = calculateCreatedDate(period);
        return offerRepository.countOffersByStatusForSupplier(supplierId, createdDate);
    }

    private OfferType validateOfferRequest(OfferRequestDto offerRequestDto) throws DtoValidateException {
        if (!offerRequestDto.startDate().isBefore(offerRequestDto.expirationDate())) {
            throw new DtoValidateException(errorGeneralAvailability);
        }

        Optional<OfferType> offerType = offerTypeRepository.findById(offerRequestDto.offerTypeId());

        if (offerType.isEmpty() || !isCitizenWithPass(offerRequestDto)) {
            throw new DtoValidateException(errorEntityValidate);
        }

        validateOfferType(offerRequestDto.offerTypeId(), offerRequestDto.amount());
        return offerType.get();
    }

    private Restriction handleRestriction(OfferRequestDto offerRequestDto) throws DtoValidateException {
        if (offerRequestDto.restrictionRequestDto() != null) {
            return restrictionService.saveRestriction(offerRequestDto.restrictionRequestDto());
        }
        return null;
    }

    private Offer saveOffer(OfferRequestDto offerRequestDto, Restriction restriction, OfferType offerType)
            throws DtoValidateNotFoundException {
        Set<Grant> grants = grantService.getAllInIds(offerRequestDto.grantsIds());
        Offer offerToSave = offerRequestDtoToEntity(offerRequestDto, offerType, getSupplier(), grants);

        if (restriction != null) {
            offerToSave.setRestriction(restriction);
        }

        return offerRepository.save(offerToSave);

    }

    private User getCurrentUser() {
        return principalService.getUser();
    }

    private UUID getTenantId() {
        return principalService.getTenantId();
    }

    private boolean isCitizenWithPass(OfferRequestDto offerRequestDto) {
        return offerRequestDto.citizenOfferType().equals("CITIZEN_WITH_PASS");
    }

    private Supplier getSupplier() throws DtoValidateNotFoundException {
        UUID supplierId = principalService.getSupplierId();
        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierId);

        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        return supplier.get();
    }

    private void sendOfferApprovedEmailToSupplier(Supplier supplier, String language) {
        String[] emailsArray = userService.getEmailsBySupplierId(supplier.getId());
        String url = baseUrl + "/login";

        emailService.sendApproveOfferEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), supplier.getCompanyName(), supplier.getTenant().getName());
    }

    private void sendOfferRejectedEmailToSupplier(Supplier supplier, RejectOfferDto rejectedOffer, String language) {
        String[] emailsArray = userService.getEmailsBySupplierId(supplier.getId());
        String url = baseUrl + "/offers/rejection-reason/" + rejectedOffer.offerId();

        emailService.sendOfferRejectedEmail(url, emailsArray, StringUtils.getLanguageForLocale(language), rejectedOffer.reason(), supplier.getCompanyName());
    }

    private LocalDateTime calculateCreatedDate(TimeIntervalPeriod period) {
        LocalDateTime now = LocalDateTime.now();

        return switch (period) {
            case MONTHLY -> DateUtils.toStartOfDay(now.withDayOfMonth(1));
            case QUARTERLY -> DateUtils.calculateQuarterlyStartDate(now);
            case YEARLY -> DateUtils.toStartOfDay(now.withDayOfYear(1));
        };
    }

    private void validateOfferType(Integer offerTypeId, Double amount) throws DtoValidateException {
        if (isAmountRequired(offerTypeId) && (amount == null || amount <= 0)) {
            throw new DtoValidateException(errorEntityValidate);
        }
    }

    private boolean isAmountRequired(Integer offerTypeId) {
        return AMOUNT_REQUIRED_OFFER_TYPES.contains(offerTypeId);
    }

}
