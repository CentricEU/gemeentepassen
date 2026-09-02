package nl.centric.innovation.local4local.service.impl;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.ApproveOfferDto;
import nl.centric.innovation.local4local.dto.DeleteOffersDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferDownloadRequestDto;
import nl.centric.innovation.local4local.dto.OfferMobileDetailDto;
import nl.centric.innovation.local4local.dto.OfferMobileListDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightView;
import nl.centric.innovation.local4local.dto.OfferRejectionReasonDto;
import nl.centric.innovation.local4local.dto.OfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferDto;
import nl.centric.innovation.local4local.dto.OfferStatusCountsDto;
import nl.centric.innovation.local4local.dto.OfferUsageRequestDto;
import nl.centric.innovation.local4local.dto.OfferViewDto;
import nl.centric.innovation.local4local.dto.OfferViewTableDto;
import nl.centric.innovation.local4local.dto.ReactivateOfferDto;
import nl.centric.innovation.local4local.dto.RejectOfferDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.RejectOffer;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.AssetsEnum;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.ExportPdfGenerationException;
import nl.centric.innovation.local4local.repository.DiscountCodeRepository;
import nl.centric.innovation.local4local.repository.OfferRepository;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.repository.RejectOfferRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.RestrictionService;
import nl.centric.innovation.local4local.util.DateUtils;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.entity.Offer.offerRequestDtoToEntity;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class OfferService {

    public static final String ORDER_CRITERIA = "title";

    private final OfferRepository offerRepository;

    private final PrincipalService principalService;

    private final SupplierService supplierService;

    private final EmailService emailService;

    private final TenantRepository tenantRepository;

    private final UserService userService;

    private final RestrictionService restrictionService;

    private final OfferTypeRepository offerTypeRepository;

    private final DiscountCodeRepository discountCodeRepository;

    private final RejectOfferRepository rejectOfferRepository;

    private final DiscountCodeService discountCodeService;

    private final OfferSearchHistoryService offerSearchHistoryService;

    private final PassholderRepository passholderRepository;

    private final BenefitService benefitService;

    private final ITemplateEngine templateEngine;


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

    @Value("${error.passholder.expired}")
    private String passExpiredError;

    @Value("${error.benefit.expired}")
    private String benefitExpiredError;

    @Value("${error.offer.editNotAllowed}")
    private String offerEditNotAllowedError;

    @Value("${error.offer.reviewNotAllowed}")
    private String offerReviewNotAllowedError;

    @Value("${error.offer.notActive}")
    private String offerNotActive;


    // Todo: to be refactored -> SRP violation
    @Transactional
    public void useOffer(OfferUsageRequestDto offerUsageRequestDto) throws DtoValidateException {
        UUID citizenId = getCurrentUser().getId();
        Passholder passholder = passholderRepository.findByUserId(citizenId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
        Offer offer = validateAndGetOffer(offerUsageRequestDto.offerId(), offerUsageRequestDto.amount(), passholder);
        discountCodeService.save(offer.getId(), citizenId);
    }

    @Transactional
    public DiscountCodeViewDto downloadDiscountCode(OfferDownloadRequestDto offerUsageRequestDto) throws DtoValidateException {
        Passholder passholder = passholderRepository.findById(offerUsageRequestDto.passholderId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
        Offer offer = validateAndGetOffer(offerUsageRequestDto.offerId(), offerUsageRequestDto.amount(), passholder);
        return discountCodeService.save(offer.getId(), passholder.getUser().getId());
    }

    private Offer validateAndGetOffer(UUID offerId, Double requestedAmount, Passholder passholder) throws DtoValidateException {
        if (passholder.expiringDate.isBefore(LocalDate.now())) {
            throw new DtoValidateException(passExpiredError);
        }
        Offer offer = offerRepository.findByIdAndStatusWithBenefitAccess(
                        offerId, GenericStatusEnum.ACTIVE, passholder.getUser().getId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
        if (offer.getBenefit().getExpirationDate().isBefore(LocalDate.now())) {
            throw new DtoValidateException(benefitExpiredError);
        }
        if (offer.getAmount() != null && requestedAmount > offer.getAmount()) {
            throw new DtoValidateException(sizeExceeded);
        }
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime offerStartDateTime = offer.getStartDate().atStartOfDay();
        LocalDateTime offerEndDateTime = offer.getExpirationDate().atTime(LocalTime.MAX);
        if (currentDateTime.isBefore(offerStartDateTime) || currentDateTime.isAfter(offerEndDateTime)) {
            throw new DtoValidateException(dateOutOfRange);
        }
        return offer;
    }

    public byte[] generateOfferPDF(DiscountCodeViewDto discoutCodeViewDto, String language) {
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             PdfWriter writer = new PdfWriter(byteArrayOutputStream)) {
            String htmlContent = generateOfferHtml(discoutCodeViewDto, language);
            HtmlConverter.convertToPdf(htmlContent, writer);
            return byteArrayOutputStream.toByteArray();
        } catch (Exception e) {
            throw new ExportPdfGenerationException("Error generating offers PDF", e);
        }
    }

    private String generateOfferHtml(DiscountCodeViewDto dto, String language) {
        Context context = new Context(Locale.forLanguageTag(language));
        context.setVariable("companyLogo", dto.companyLogo() != null
                ? "data:image/png;base64," + dto.companyLogo()
                : baseUrl + AssetsEnum.LOCAL_LOGO.getPath());
        context.setVariable("companyName", dto.companyName());
        context.setVariable("offerTypeKey", dto.offerType().getOfferTypeLabel());
        context.setVariable("expirationDate", dto.expirationDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        context.setVariable("code", dto.code());
        context.setVariable("offerTitle", dto.offerTitle());
        context.setVariable("color", getHexColorBasedOnOfferTypeId(dto.offerType().getOfferTypeId()));

        return templateEngine.process("offerTemplate", context);
    }

    private String getHexColorBasedOnOfferTypeId(Integer offerTypeId) {
        return switch (offerTypeId) {
            case 1 -> "#B60809";
            case 2 -> "#FF7C02";
            case 3 -> "#28713D";
            case 4 -> "#2B65C6";
            case 5 -> "#8448A3";
            default -> "#B60809";
        };
    }

    @Transactional
    public OfferViewDto editOffer(UUID offerId, OfferRequestDto dto, String language) throws DtoValidateException {
        Supplier supplier = getSupplier();

        if (!supplier.getIsReviewed()) {
            throw new DtoValidateException("Supplier profile must be reviewed before editing an offer");
        }

        Offer offer = offerRepository.findByIdAndSupplierId(offerId, principalService.getSupplierId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        if (!Objects.equals(dto.version(), offer.getVersion())) {
            throw new DtoValidateException(offerEditNotAllowedError);
        }

        boolean hasClaims = discountCodeService.isDiscountCodeClaimedForOffer(offerId);

        switch (offer.getStatus()) {
            case ACTIVE, EXPIRED, REJECTED -> handleOfferEdit(offer, dto, hasClaims);
            case PENDING -> applyEditableFields(offer, dto, !hasClaims);
            default -> throw new DtoValidateException("Offer cannot be edited in its current status");
        }

        Offer savedOffer = offerRepository.save(offer);

        sendReviewOfferEmail(getTenantId(), language, getCurrentUser());

        return OfferViewDto.entityToOfferViewDto(savedOffer);
    }

    public List<OfferViewDto> createOffer(OfferRequestDto offerRequestDto, String language) throws DtoValidateException {
        Set<UUID> benefitIds = offerRequestDto.benefitIds();

        List<OfferViewDto> savedOffers = new ArrayList<>();

        Restriction restriction = handleRestriction(offerRequestDto);

        for (UUID benefitId : benefitIds) {
            Benefit benefit = getBenefit(benefitId);
            OfferType offerType = validateOfferRequest(offerRequestDto, benefit);

            Offer savedOffer = saveOffer(offerRequestDto, restriction, offerType, benefit);


            savedOffers.add(OfferViewDto.entityToOfferViewDto(savedOffer));
        }

        sendReviewOfferEmail(getTenantId(), language, getCurrentUser());

        return savedOffers;
    }

    public List<OfferViewTableDto> getAll(Integer page, Integer size) {
        UUID supplierId = principalService.getSupplierId();

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        Page<Offer> offers = offerRepository.findAllBySupplierIdAndIsActive(supplierId, true, pageable);
        return offers.stream()
                .map(OfferViewTableDto::entityToOfferViewTableDto)
                .toList();
    }

    public List<OfferViewTableDto> getAllForTenantPaginated(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        List<GenericStatusEnum> statusList = Arrays.asList(GenericStatusEnum.PENDING, GenericStatusEnum.REJECTED);

        Page<Offer> offers = offerRepository.findAllBySupplierTenantIdAndIsActiveTrueAndStatusIn(getTenantId(), pageable, statusList);
        return offers.stream()
                .map(OfferViewTableDto::entityToOfferViewTableDto).toList();
    }

    public List<OfferViewTableDto> getAllForPassholder(UUID passholderId) throws DtoValidateException {
        UUID tenantId = principalService.getTenantId();

        Optional<Passholder> passholder = passholderRepository.findByIdAndTenantId(passholderId, tenantId);

        if (passholder.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        if (passholder.get().expiringDate.isBefore(LocalDate.now())) {
            throw new DtoValidateException(passExpiredError);
        }

        List<Offer> offers = offerRepository.findAllActiveOffersForPassholderId(passholderId, tenantId);
        return offers.stream()
                .map(OfferViewTableDto::entityToOfferViewTableDto).toList();
    }

    public List<OfferViewTableDto> getAllBySupplierIdPaginated(Integer page, Integer size, UUID supplierId) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));

        Page<Offer> offers = offerRepository.findAllBySupplierIdAndIsActive(supplierId, true, pageable);
        return offers.stream()
                .map(OfferViewTableDto::entityToOfferViewTableDto).toList();
    }

    public Map<String, List<OfferMobileMapLightView>> getOffersWithinViewport(Double minLatitude, Double maxLatitude,
                                                                             Double minLongitude, Double maxLongitude,
                                                                             LocalDate currentDay,
                                                                             Integer offerType,
                                                                             String searchKeyword) {
        List<OfferMobileMapLightView> offers = findOffersInViewport(minLatitude, maxLatitude, minLongitude, maxLongitude,
                currentDay, offerType, searchKeyword);

        return offers.stream()
                .collect(Collectors.groupingBy(OfferMobileMapLightView::getCoordinatesString));
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
        Optional<Tenant> tenant = tenantRepository.findById(tenantId);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        String tenantName = tenant.get().getName();

        List<User> adminList = userService.findAllAdminsByTenantId(tenantId);

        String url = baseMunicipalityUrl + "/offers";

        String[] emailsArray = adminList.stream().map(User::getUsername).toArray(String[]::new);
        String fullName = String.format("%s %s", user.getFirstName(), user.getLastName());
        String languageLocale = StringUtils.getLanguageForLocale(language);
        String companyName = user.getSupplier().getCompanyName();

        emailService.sendOfferReviewEmail(url, emailsArray, languageLocale, tenantName, companyName, fullName);
    }

    @Transactional
    public void suspendOffer(UUID offerId) throws DtoValidateException {
        Offer offer = offerRepository.findByIdAndSupplierId(offerId, principalService.getSupplierId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        validateOfferStatus(offer);

        discountCodeRepository.deactivateAllByOfferId(offerId);

        offer.expireNow();
        offerRepository.save(offer);
    }

    @Transactional
    public void approveOffer(ApproveOfferDto dto, String language) throws DtoValidateException {
        Optional<Offer> offer = offerRepository.findById(dto.offerId());

        if (offer.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        if (!Objects.equals(dto.version(), offer.get().getVersion())) {
            throw new DtoValidateException(offerReviewNotAllowedError);
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

    public List<OfferMobileListDto> getOffersOrderedByDistanceToUser(Integer page, Double latitude, Double longitude,
                                                                     LocalDate currentDay, String searchKeyword, Integer offerType)
            throws DtoValidateException {
        if (Double.isNaN(latitude) || Double.isNaN(longitude)) {
            throw new DtoValidateException(errorEntityValidate);
        }

        Pageable pageable = PageRequest.of(page, 20);

        if (isNotBlank(searchKeyword)) {
            offerSearchHistoryService.saveSearchHistory(searchKeyword);
            return offerRepository.findSearchedOffersOrderedByDistanceToUser(pageable, latitude, longitude,
                    getTenantId(), currentDay, getCurrentUser().getId(), searchKeyword, offerType);
        }

        return offerRepository.findAllOffersOrderedByDistanceToUser(pageable, latitude, longitude, getTenantId(),
                currentDay, getCurrentUser().getId(), offerType);
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

    public void deleteOffers(DeleteOffersDto deleteOffersDto) throws DtoValidateNotFoundException {
        UUID supplierId = principalService.getSupplierId();
        List<Offer> offers = offerRepository.findAllById(deleteOffersDto.offersIds());

        for (Offer offer : offers) {
            if (!offer.getSupplier().getId().equals(supplierId)) {
                throw new DtoValidateNotFoundException(errorEntityNotFound);
            }
        }

        offers.forEach(offer -> offer.setActive(false));

        offerRepository.saveAll(offers);
    }

    public Offer reactivateOffer(ReactivateOfferDto reactivateOfferDto) throws DtoValidateNotFoundException {
        if (reactivateOfferDto.expirationDate().isBefore(reactivateOfferDto.startDate())) {
            throw new DtoValidateNotFoundException(errorGeneralAvailability);
        }

        Offer offerToReactivate = offerRepository.findByIdAndSupplierId(reactivateOfferDto.offerId(), principalService.getSupplierId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        offerToReactivate.setStartDate(reactivateOfferDto.startDate());
        offerToReactivate.setExpirationDate(reactivateOfferDto.expirationDate());
        offerToReactivate.setCreatedDate(LocalDateTime.now());

        offerToReactivate.setStatus(GenericStatusEnum.PENDING);

        offerRepository.save(offerToReactivate);
        return offerToReactivate;
    }

    public List<OfferViewTableDto> getFilteredOffers(FilterOfferRequestDto filterParams, Integer pageIndex, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageIndex, pageSize);
        List<Offer> offers = offerRepository.findAllWithSpecification(principalService.getSupplierId(), filterParams, pageable);

        return offers.stream()
                .map(OfferViewTableDto::entityToOfferViewTableDto).toList();
    }

    @Transactional
    public OfferDto getFullOffer(UUID offerId) throws DtoValidateNotFoundException {
        Offer offer = offerRepository.findByIdAndSupplierId(offerId, principalService.getSupplierId())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        return OfferDto.entityToOfferDto(offer);
    }

    public void rejectOffer(RejectOfferDto rejectOfferDto, String language) throws DtoValidateException {
        Optional<Offer> offer = offerRepository.findById(rejectOfferDto.offerId());

        if (offer.isEmpty()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        if (!Objects.equals(rejectOfferDto.version(), offer.get().getVersion())) {
            throw new DtoValidateException(offerReviewNotAllowedError);
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
        LocalDateTime createdDate = DateUtils.calculateCreatedDate(period);
        return offerRepository.countOffersByStatusForSupplier(supplierId, createdDate);
    }

    public List<String> searchOffersByKeyword(String keyword) {
        return offerRepository.searchByTitlePrefix(keyword, getTenantId(), GenericStatusEnum.ACTIVE, getCurrentUser().getId());
    }

    private List<OfferMobileMapLightView> findOffersInViewport(Double minLatitude, Double maxLatitude,
                                                               Double minLongitude, Double maxLongitude,
                                                               LocalDate currentDay, Integer offerType,
                                                               String searchKeyword) {
        if (isNotBlank(searchKeyword)) {
            return offerRepository.findActiveSearchOffersInViewport(minLatitude, maxLatitude, minLongitude, maxLongitude,
                    currentDay, getTenantId(), offerType, getCurrentUser().getId(), searchKeyword);
        }
        return offerRepository.findActiveOffersInViewport(minLatitude, maxLatitude, minLongitude, maxLongitude, currentDay,
                getTenantId(), offerType, getCurrentUser().getId());
    }

    private OfferType validateOfferRequest(OfferRequestDto offerRequestDto, Benefit benefit) throws DtoValidateException {
        if (offerRequestDto.startDate().isBefore(benefit.getStartDate()) || offerRequestDto.expirationDate().isAfter(benefit.getExpirationDate())) {
            throw new DtoValidateException(errorGeneralAvailability);
        }

        if (!offerRequestDto.startDate().isBefore(offerRequestDto.expirationDate())) {
            throw new DtoValidateException(errorGeneralAvailability);
        }

        Optional<OfferType> offerType = offerTypeRepository.findById(offerRequestDto.offerTypeId());

        if (offerType.isEmpty() || !isCitizenWithPass(offerRequestDto)) {
            throw new DtoValidateException(errorEntityValidate);
        }
        return offerType.get();
    }

    private Restriction handleRestriction(OfferRequestDto offerRequestDto) throws DtoValidateException {
        if (offerRequestDto.restrictionRequestDto() != null) {
            return restrictionService.saveRestriction(offerRequestDto.restrictionRequestDto());
        }
        return null;
    }

    private Offer saveOffer(OfferRequestDto offerRequestDto, Restriction restriction, OfferType offerType, Benefit benefit)
            throws DtoValidateException {

        Offer offerToSave = offerRequestDtoToEntity(offerRequestDto, offerType, getSupplier(), benefit);

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

    private Benefit getBenefit(UUID benefitId) throws DtoValidateException {
        Optional<Benefit> benefit = benefitService.findById(benefitId);

        if (benefit.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        if (!benefit.get().getTenantId().equals(getTenantId())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        return benefit.get();
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

    private void handleOfferEdit(Offer offer, OfferRequestDto dto, boolean hasClaims) throws DtoValidateException {
        applyEditableFields(offer, dto, !hasClaims);
        offer.setStatus(GenericStatusEnum.PENDING);
    }

    private void validateOfferStatus(Offer offer) throws DtoValidateException {
        if (!offer.isActiveOffer()) {
            throw new DtoValidateException(offerNotActive);
        }
    }

    private void applyEditableFields(Offer offer, OfferRequestDto dto, boolean allowFullEdit) throws DtoValidateException {
        offer.setTitle(dto.title());
        offer.setDescription(dto.description());
        offer.setStartDate(dto.startDate());
        offer.setExpirationDate(dto.expirationDate());

        if (allowFullEdit) {
            Benefit benefit = getBenefit(dto.benefitIds().iterator().next());
            OfferType offerType = validateOfferRequest(dto, benefit);

            offer.setAmount(dto.amount());
            offer.setOfferType(offerType);
            offer.setBenefit(benefit);

            if (dto.restrictionRequestDto() != null) {
                offer.setRestriction(restrictionService.saveRestriction(dto.restrictionRequestDto()));
                return;
            }
            if (offer.getRestriction() != null) {
                restrictionService.deleteRestriction(offer.getRestriction().getId());
                offer.setRestriction(null);
            }
        }
    }

}
