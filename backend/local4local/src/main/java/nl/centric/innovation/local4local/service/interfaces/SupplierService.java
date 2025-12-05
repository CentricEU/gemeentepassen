package nl.centric.innovation.local4local.service.interfaces;

import nl.centric.innovation.local4local.dto.RegisterSupplierDto;
import nl.centric.innovation.local4local.dto.RejectSupplierDto;
import nl.centric.innovation.local4local.dto.SupplierForMapViewDto;
import nl.centric.innovation.local4local.dto.SupplierViewDto;
import nl.centric.innovation.local4local.entity.RejectSupplier;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.L4LException;
import nl.centric.innovation.local4local.exceptions.NotFoundException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface SupplierService {

    void rejectSupplier(RejectSupplierDto rejectSupplierDto, String language, String reason) throws DtoValidateException;

    void approveSupplier(UUID supplierId, String language) throws DtoValidateException;

    void sendReviewEmailToSupplier(Supplier supplier, SupplierStatusEnum status, String language) throws DtoValidateNotFoundException;

    void sendRejectEmailToSupplier(Supplier supplier, String language, String reason) throws DtoValidateNotFoundException;

    void updateSupplierStatus(Supplier supplier, SupplierStatusEnum status);

    void updateSupplierHasStatusUpdate(UUID supplierId, boolean value);

    void save(RegisterSupplierDto registerSupplierDto, Optional<Tenant> tenant, String language) throws DtoValidateException;

    Optional<Supplier> findBySupplierId(UUID supplierId);

    Optional<RejectSupplier> findRejectedSupplier(UUID supplierId);

    List<SupplierViewDto> getAllByTenantIdAndStatus(UUID tenantId, int page, int size, SupplierStatusEnum status) throws DtoValidateException;

    List<SupplierForMapViewDto> getAllByTenantIdForMap(UUID tenantId) throws DtoValidateException;

    List<SupplierViewDto> getAllByTenantIdAndStatusIn(UUID tenantId, int page, int size, Set<SupplierStatusEnum> status) throws DtoValidateException;

    RejectSupplierDto getRejectedSupplier(UUID supplierId) throws DtoValidateException;

    Integer countAllByTenantIdAndStatus(UUID tenantId, Set<SupplierStatusEnum> statuses) throws DtoValidateNotFoundException;

    Supplier getSupplierWithProfile(UUID supplierId) throws L4LException, NotFoundException;

}
