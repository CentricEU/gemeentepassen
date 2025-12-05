package nl.centric.innovation.local4local.service.interfaces;

import java.util.List;
import java.util.UUID;

import nl.centric.innovation.local4local.dto.WorkingHoursCreateDto;
import nl.centric.innovation.local4local.dto.WorkingHoursDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.WorkingHours;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;

public interface WorkingHoursService {

    List<WorkingHours> createWorkingHours(List<WorkingHoursCreateDto> userList, Supplier supplier) throws DtoValidateException;

    List<WorkingHoursDto> editAll(List<WorkingHoursDto> userList, Supplier supplier) throws DtoValidateException;

    List<WorkingHoursDto> getWorkingHoursForSupplier(UUID supplierId);

}
