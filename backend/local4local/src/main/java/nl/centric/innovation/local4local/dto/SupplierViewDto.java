package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record SupplierViewDto(UUID id,
                              String companyName,
                              String kvk,
                              LocalDateTime createdDate,
                              SupplierStatusEnum status,
                              String category,
                              String province,
                              String accountManager,
                              Boolean hasStatusUpdate,
                              String logo
) {
    public static SupplierViewDto entityToSupplierViewDto(Supplier supplier) {
        if (supplier.getProfile() == null) {
            return SupplierViewDto.builder()
                    .id(supplier.getId())
                    .createdDate(supplier.getCreatedDate())
                    .companyName(supplier.getCompanyName())
                    .kvk(supplier.getKvk())
                    .status(supplier.getStatus())
                    .hasStatusUpdate(supplier.isHasStatusUpdate())
                    .build();
        }

        return SupplierViewDto.builder()
                .id(supplier.getId())
                .province(supplier.getProfile().getBranchProvince())
                .accountManager(supplier.getProfile().getAccountManager())
                .category(supplier.getProfile().getCategory().getCategoryLabel())
                .createdDate(supplier.getCreatedDate())
                .companyName(supplier.getCompanyName())
                .kvk(supplier.getKvk())
                .status(supplier.getStatus())
                .hasStatusUpdate(supplier.isHasStatusUpdate())
                .logo(supplier.getProfile().getLogo())
                .build();
    }
}
