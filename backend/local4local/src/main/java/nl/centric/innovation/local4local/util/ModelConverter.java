package nl.centric.innovation.local4local.util;

import java.sql.Time;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.stream.Collectors;

import nl.centric.innovation.local4local.dto.CitizenViewDto;
import nl.centric.innovation.local4local.dto.GrantRequestDto;
import nl.centric.innovation.local4local.dto.GrantViewDto;
import nl.centric.innovation.local4local.dto.OfferDetailsViewDto;
import nl.centric.innovation.local4local.dto.OfferTransactionResponseDto;
import nl.centric.innovation.local4local.dto.OfferViewDto;
import nl.centric.innovation.local4local.dto.OfferViewTableDto;
import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;
import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RegisterUserDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.RestrictionRequestDto;
import nl.centric.innovation.local4local.dto.RestrictionViewDto;
import nl.centric.innovation.local4local.dto.SupplierForMapViewDto;
import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.dto.SupplierProfileViewDto;
import nl.centric.innovation.local4local.dto.TenantViewDto;
import nl.centric.innovation.local4local.dto.UserViewDto;
import nl.centric.innovation.local4local.entity.Category;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.Group;
import nl.centric.innovation.local4local.entity.LegalForm;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.entity.Subcategory;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

public class ModelConverter {

    public static User registerUserToEntity(RegisterUserDto registerUserDto) {
        return User.builder()
                .username(registerUserDto.email())
                .firstName(registerUserDto.firstName())
                .lastName(registerUserDto.lastName())
                .tenantId(registerUserDto.tenantId())
                .build();
    }


    public static User registerCitizenToEntity(RegisterCitizenUserDto registerUserDto) {
        return User.builder()
                .username(registerUserDto.email())
                .firstName(registerUserDto.firstName())
                .lastName(registerUserDto.lastName())
                .build();
    }

    public static Supplier registerSupplierToEntity(RegisterSupplierDto registerSupplierDto, Tenant tenant) {
        return Supplier.builder()
                .companyName(registerSupplierDto.companyName())
                .adminEmail(registerSupplierDto.email())
                .kvk(registerSupplierDto.kvk())
                .tenant(tenant)
                .isProfileSet(false)
                .status(SupplierStatusEnum.CREATED)
                .build();
    }

    public static SupplierProfile supplierProfileToEntity(SupplierProfileDto supplierProfileDto) {
        return SupplierProfile.builder()
                .logo(supplierProfileDto.logo())
                .ownerName(supplierProfileDto.ownerName())
                .legalForm(LegalForm.builder().id(supplierProfileDto.legalForm()).build())
                .groupName(Group.builder().id(supplierProfileDto.group()).build())
                .category(Category.builder().id(supplierProfileDto.category()).build())
                .subcategory(Subcategory.builder().id(supplierProfileDto.subcategory()).build())
                .companyBranchAddress(supplierProfileDto.companyBranchAddress())
                .branchProvince(supplierProfileDto.branchProvince())
                .branchZip(supplierProfileDto.branchZip())
                .branchLocation(supplierProfileDto.branchLocation())
                .branchTelephone(supplierProfileDto.branchTelephone())
                .email(supplierProfileDto.email())
                .website(supplierProfileDto.website())
                .accountManager(supplierProfileDto.accountManager())
                .coordinatesString(supplierProfileDto.latlon().toString())
                .build();
    }

    public static RegisterUserDto registerSupplierDtoToRegisterUserDto(RegisterSupplierDto registerSupplierDto) {
        return RegisterUserDto.builder()
                .email(registerSupplierDto.email())
                .retypedPassword(registerSupplierDto.retypedPassword())
                .password(registerSupplierDto.password())
                .tenantId(registerSupplierDto.tenantId())
                .firstName(registerSupplierDto.firstName())
                .lastName(registerSupplierDto.lastName())
                .build();
    }

    public static SupplierForMapViewDto entityToSupplierForMapViewDto(Supplier supplier) {
        return SupplierForMapViewDto.builder()
                .id(supplier.getId())
                .companyName(supplier.getCompanyName())
                .coordinatesString(supplier.getProfile().getCoordinatesString())
                .build();
    }

    public static TenantViewDto entityToTenantViewDto(Tenant tenant) {
        return TenantViewDto.builder()
                .id(tenant.getId())
                .createdDate(tenant.getCreatedDate())
                .name(tenant.getName())
                .address(tenant.getAddress())
                .build();
    }

    public static RejectSupplierDto entityToRejectSupplierDto(RejectSupplier rejectSupplier) {
        return RejectSupplierDto.builder()
                .reason(rejectSupplier.getReason())
                .comments(rejectSupplier.getComments())
                .supplierId(rejectSupplier.getSupplier().getId())
                .build();
    }

    public static UserViewDto entityToUserViewDto(User user) {
        return UserViewDto.builder()
                .companyName(user.getSupplier().getCompanyName())
                .kvkNumber(user.getSupplier().getKvk())
                .email(user.getUsername())
                .status(user.getSupplier().getStatus())
                .isProfileSet(user.getSupplier().getIsProfileSet())
                .isApproved(user.isApproved())
                .supplierId(user.getSupplier().getId())
                .build();
    }

    public static CitizenViewDto entityToCitizenViewDto(User user) {
        return CitizenViewDto.builder()
                .email(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    public static Passholder passholderViewDtoToEntity(PassholderViewDto passholder, Tenant tenant) {
        return Passholder.builder()
                .address(passholder.address())
                .bsn(passholder.bsn())
                .expiringDate(passholder.expiringDate())
                .residenceCity(passholder.residenceCity())
                .name(passholder.name())
                .passNumber(passholder.passNumber())
                .grants(passholder.grants())
                .tenant(tenant)
                .build();
    }

    public static SupplierProfileViewDto entityToSupplierProfileViewDto(Supplier supplier) {
        SupplierProfile supplierProfile = supplier.getProfile();
        return SupplierProfileViewDto.builder()
                .supplierId(supplier.getId())
                .logo(supplierProfile.getLogo())
                .kvkNumber(supplier.getKvk())
                .companyName(supplier.getCompanyName())
                .adminEmail(supplier.getAdminEmail())
                .ownerName(supplierProfile.getOwnerName())
                .legalForm(supplierProfile.getLegalForm().getId())
                .group(supplierProfile.getGroupName().getId())
                .category(supplierProfile.getCategory().getId())
                .subcategory(supplierProfile.getSubcategory() != null ? supplierProfile.getSubcategory().getId() : null)
                .companyBranchAddress(supplierProfile.getCompanyBranchAddress())
                .branchProvince(supplierProfile.getBranchProvince())
                .branchZip(supplierProfile.getBranchZip())
                .branchLocation(supplierProfile.getBranchLocation())
                .branchTelephone(supplierProfile.getBranchTelephone())
                .email(supplierProfile.getEmail())
                .website(supplierProfile.getWebsite())
                .accountManager(supplierProfile.getAccountManager())
                .build();
    }

    public static Grant grantRequestDtoToEntity(GrantRequestDto grantRequestDto, Tenant tenant) {
        return Grant.builder()
                .title(grantRequestDto.title())
                .amount(grantRequestDto.amount())
                .createFor(grantRequestDto.createFor())
                .description(grantRequestDto.description())
                .startDate(grantRequestDto.startDate())
                .expirationDate(grantRequestDto.expirationDate())
                .tenant(tenant)
                .build();
    }

    public static RejectSupplier rejectSupplierToEntity(RejectSupplierDto rejectSupplierDto, Supplier supplier) {
        return RejectSupplier.builder()
                .reason(rejectSupplierDto.reason())
                .comments(rejectSupplierDto.comments())
                .supplier(supplier)
                .build();
    }

    private static String dateFormatter(LocalDate originalDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return originalDate.format(formatter);
    }

    public static OfferViewDto entityToOfferViewDto(Offer offer, Set<GrantViewDto> grants) {
        return OfferViewDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .citizenOfferType(offer.getCitizenOfferType())
                .offerType(offer.getOfferType())
                .description(offer.getDescription())
                .amount(offer.getAmount())
                .startDate(offer.getStartDate())
                .expirationDate(offer.getExpirationDate())
                .coordinatesString(offer.getCoordinatesString())
                .status(offer.getStatus())
                .grants(grants)
                .companyName(offer.getSupplier().getCompanyName())
                .build();
    }

    public static OfferViewTableDto entityToOfferViewTableDto(Offer offer, Set<GrantViewDto> grants) {
        return OfferViewTableDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .supplierName(offer.getSupplier().getCompanyName())
                .supplierId(offer.getSupplier().getId())
                .citizenOfferType("offer.citizenWithPass")
                .startDate(offer.getStartDate())
                .description(offer.getDescription())
                .expirationDate(offer.getExpirationDate())
                .offerType(offer.getOfferType().getOfferTypeLabel())
                .amount(offer.getAmount())
                .validity(dateFormatter(offer.getStartDate()) + " - " + dateFormatter(offer.getExpirationDate()))
                .status(offer.getStatus())
                .grants(grants)
                .build();

    }

    public static OfferViewDto entityToOfferViewDto(Offer offer) {
        return OfferViewDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .citizenOfferType(offer.getCitizenOfferType())
                .offerType(offer.getOfferType())
                .description(offer.getDescription())
                .amount(offer.getAmount())
                .startDate(offer.getStartDate())
                .expirationDate(offer.getExpirationDate())
                .coordinatesString(offer.getCoordinatesString())
                .status(offer.getStatus())
                .companyName(offer.getSupplier().getCompanyName())
                .build();
    }

    public static Set<GrantViewDto> grantToGrantViewDto(Set<Grant> grants) {
        return grants.stream()
                .map(grant -> GrantViewDto.builder()
                        .id(grant.getId())
                        .title(grant.getTitle())
                        .amount(grant.getAmount())
                        .description(grant.getDescription())
                        .startDate(grant.getStartDate())
                        .expirationDate(grant.getExpirationDate())
                        .createFor(grant.getCreateFor())
                        .build())
                .collect(Collectors.toSet());
    }

    public static Restriction restrictionRequestDtoToEntity(RestrictionRequestDto restrictionRequestDto) {
        return Restriction.builder()
                .ageRestriction(restrictionRequestDto.ageRestriction())
                .frequencyOfUse(restrictionRequestDto.frequencyOfUse())
                .maxPrice(restrictionRequestDto.maxPrice())
                .minPrice(restrictionRequestDto.minPrice())
                .timeFrom(restrictionRequestDto.timeFrom() != null ?
                        Time.valueOf(restrictionRequestDto.timeFrom().toLocalTime()) : null)
                .timeTo(restrictionRequestDto.timeTo() != null ?
                        Time.valueOf(restrictionRequestDto.timeTo().toLocalTime()) : null)
                .build();
    }

    public static RestrictionViewDto entityToRestrictionViewDto(Restriction restriction) {
        return RestrictionViewDto.builder()
                .id(restriction.getId())
                .ageRestriction(restriction.getAgeRestriction())
                .frequencyOfUse(restriction.getFrequencyOfUse())
                .maxPrice(restriction.getMaxPrice())
                .minPrice(restriction.getMinPrice())
                .timeFrom(restriction.getTimeFrom())
                .timeTo(restriction.getTimeTo())
                .build();
    }

    public static OfferDetailsViewDto entityToOfferDetailsViewDto(Offer offer, OfferTransaction lastOfferTransaction) {
        return OfferDetailsViewDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .amount(offer.getAmount())
                .citizenOfferType("offer.citizenWithPass")
                .offerType(offer.getOfferType())
                .startDate(offer.getStartDate())
                .expirationDate(offer.getExpirationDate())
                .status(offer.getStatus())
                .companyName(offer.getSupplier().getCompanyName())
                .companyAddress(offer.getSupplier().getProfile().getCompanyBranchAddress())
                .restrictions(offer.getRestriction() != null ? entityToRestrictionViewDto(offer.getRestriction()) : null)
                .companyLogo(offer.getSupplier().getProfile().getLogo())
                .grants(offer.getGrants().stream().map(GrantViewDto::entityToGrantViewDto).collect(Collectors.toSet()))
                .lastOfferTransaction(lastOfferTransaction != null ? OfferTransactionResponseDto.entityToOfferTransactionResponseDto(lastOfferTransaction) : null)
                .build();
    }

}
