package nl.centric.innovation.local4local.util;

import java.sql.Time;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import nl.centric.innovation.local4local.dto.BenefitLightDto;
import nl.centric.innovation.local4local.dto.CitizenViewDto;
import nl.centric.innovation.local4local.dto.OfferViewDto;
import nl.centric.innovation.local4local.dto.OfferViewTableDto;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;
import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RegisterUserDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.RestrictionRequestDto;
import nl.centric.innovation.local4local.dto.RestrictionViewDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

// For now, we're not adding any more mapper classes here. These should be added to the Entity/Dto classes.

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

    public static RejectSupplierDto entityToRejectSupplierDto(RejectSupplier rejectSupplier) {
        return RejectSupplierDto.builder()
                .reason(rejectSupplier.getReason())
                .comments(rejectSupplier.getComments())
                .supplierId(rejectSupplier.getSupplier().getId())
                .build();
    }

    public static CitizenViewDto entityToCitizenViewDto(User user) {
        return CitizenViewDto.builder()
                .email(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
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

    public static OfferViewDto entityToOfferViewDto(Offer offer, Benefit benefit) {
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
                .benefit(BenefitLightDto.entityToBenefitTableDto(benefit))
                .companyName(offer.getSupplier().getCompanyName())
                .build();
    }

    public static OfferViewTableDto entityToOfferViewTableDto(Offer offer) {
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
                .benefit(ModelConverter.entityToBenefitLightDto(offer.getBenefit()))
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
                .benefit(BenefitLightDto.entityToBenefitTableDto(offer.getBenefit()))
                .companyName(offer.getSupplier().getCompanyName())
                .build();
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

    public static BenefitLightDto entityToBenefitLightDto(Benefit benefit) {
        return BenefitLightDto.builder()
                .id(benefit.getId())
                .name(benefit.getName())
                .description(benefit.getDescription())
                .startDate(benefit.getStartDate())
                .expirationDate(benefit.getExpirationDate())
                .build();
    }
}
