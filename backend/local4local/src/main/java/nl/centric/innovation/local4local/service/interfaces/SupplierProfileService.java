package nl.centric.innovation.local4local.service.interfaces;

import nl.centric.innovation.local4local.dto.SupplierProfileDto;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;

import java.util.UUID;

public interface SupplierProfileService {
    SupplierProfileDto save(SupplierProfileDto supplierProfileDto) throws DtoValidateException;

    void sendProfileSetupEmailToAllAdmins(UUID tenantId, SupplierProfileDto supplierProfileDto, String language) throws DtoValidateNotFoundException;

    void updateSupplierProfile(SupplierProfileDto supplierProfileDto) throws DtoValidateException;

}
