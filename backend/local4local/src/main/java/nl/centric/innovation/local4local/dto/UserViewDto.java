package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

import java.util.UUID;

@Builder
public record UserViewDto(
        String companyName,
        String kvkNumber,
        String email,
        SupplierStatusEnum status,
        Boolean isProfileSet,
        Boolean isApproved,
        UUID supplierId,
        String firstName,
        String lastName) {

    public static UserViewDto entityToUserViewDtoMunicipality(User user) {
        return UserViewDto.builder()
                .email(user.getUsername())
                .isApproved(user.isApproved())
                .build();
    }
    public static UserViewDto entityToUserViewDtoSupplier(User user) {
        return UserViewDto.builder()
                .companyName(user.getSupplier().getCompanyName())
                .kvkNumber(user.getSupplier().getKvk())
                .email(user.getUsername())
                .status(user.getSupplier().getStatus())
                .isProfileSet(user.getSupplier().getIsProfileSet())
                .isApproved(user.isApproved())
                .supplierId(user.getSupplier().getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}