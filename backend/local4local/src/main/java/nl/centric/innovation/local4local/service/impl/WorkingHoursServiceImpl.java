package nl.centric.innovation.local4local.service.impl;

import java.sql.Time;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import nl.centric.innovation.local4local.dto.WorkingHoursDto;
import nl.centric.innovation.local4local.dto.WorkingHoursCreateDto;
import nl.centric.innovation.local4local.entity.WorkingHours;
import nl.centric.innovation.local4local.repository.WorkingHoursRepository;
import nl.centric.innovation.local4local.service.interfaces.WorkingHoursService;

@Service
@RequiredArgsConstructor
public class WorkingHoursServiceImpl implements WorkingHoursService {

    private final WorkingHoursRepository workingHoursRepository;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Override
    public List<WorkingHoursDto> editAll(List<WorkingHoursDto> workingHours, Supplier supplier) throws DtoValidateException {
        List<WorkingHours> workingHoursToSave = new ArrayList<>();

        List<UUID> incomingIds = workingHours.stream()
                .map(WorkingHoursDto::id)
                .collect(Collectors.toList());
        List<WorkingHours> existingWorkingHours = workingHoursRepository.findAllByIdInAndSupplierId(incomingIds, supplier.getId());

        if (existingWorkingHours.size() != workingHours.size()) {
            throw new DtoValidateException(errorEntityNotFound);
        }

        for (WorkingHoursDto workingHoursDto : workingHours) {
            validateWorkingHours(workingHoursDto.isChecked(), workingHoursDto.openTime(), workingHoursDto.closeTime());
            workingHoursToSave.add(WorkingHours.workingHoursDtoToEntity(workingHoursDto, supplier));
        }

        List<WorkingHours> workingHoursList = (List<WorkingHours>) workingHoursRepository.saveAll(workingHoursToSave);

        return workingHoursList.stream()
                .map(WorkingHoursDto::workingHoursEntityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkingHours> createWorkingHours(List<WorkingHoursCreateDto> workingHours, Supplier supplier) throws DtoValidateException {
        List<WorkingHours> workingHoursToSave = new ArrayList<>();

        for (WorkingHoursCreateDto workingHoursCreateDto : workingHours) {
            validateWorkingHours(workingHoursCreateDto.isChecked(), workingHoursCreateDto.openTime(), workingHoursCreateDto.closeTime());
            workingHoursToSave.add(WorkingHours.workingHoursCreateDtoToEntity(workingHoursCreateDto, supplier));
        }

        return workingHoursToSave;
    }

    @Override
    public List<WorkingHoursDto> getWorkingHoursForSupplier(UUID supplierId) {
        List<WorkingHours> workingHoursList = workingHoursRepository.findAllBySupplierIdOrderByDayAsc(supplierId);
        return workingHoursList.stream()
                .map(WorkingHoursDto::workingHoursEntityToDto)
                .collect(Collectors.toList());
    }

    private void validateWorkingHours(boolean isChecked, String openTime, String closeTime) throws DtoValidateException {
        if (isChecked &&
                Time.valueOf(openTime).compareTo(Time.valueOf(closeTime)) >= 0) {
            throw new DtoValidateException(errorEntityValidate);
        }
    }

}
