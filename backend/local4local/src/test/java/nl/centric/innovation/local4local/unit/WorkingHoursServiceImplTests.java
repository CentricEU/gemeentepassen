package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.WorkingHoursCreateDto;
import nl.centric.innovation.local4local.dto.WorkingHoursDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.WorkingHours;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.WorkingHoursRepository;
import nl.centric.innovation.local4local.service.impl.WorkingHoursServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class WorkingHoursServiceImplTests {
    @InjectMocks
    private WorkingHoursServiceImpl workingHoursService;

    @Mock
    private WorkingHoursRepository workingHoursRepository;

    private static final UUID SUPPLIER_ID = UUID.randomUUID();
    private static final String AM_10 = "10:00:00";
    private static final String AM_5 = "05:00:00";

    @Test
    @SneakyThrows
    public void GivenEmptyArray_WhenEditAll_ShouldReturnEmptyArray() {
        List<WorkingHoursDto> inputWorkingHoursDtos = new ArrayList<>();

        List<WorkingHoursDto> savedWorkingHoursDtos = workingHoursService.editAll(inputWorkingHoursDtos,
                Supplier.builder().build());

        assertTrue(savedWorkingHoursDtos.isEmpty());
    }

    @Test
    @SneakyThrows
    public void GivenValidData_WhenEditAll_ThenExpectSuccess() {
        // Given
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);
        WorkingHoursDto workingHours = workingHoursDtoBuilder(1, false);

        List<WorkingHoursDto> inputWorkingHoursDtos = List.of(workingHours);

        List<WorkingHours> expectedWorkingHoursEntities =
                List.of(WorkingHours.workingHoursDtoToEntity(workingHours, supplier));

        List<WorkingHours> savedWorkingHoursEntities = new ArrayList<>(expectedWorkingHoursEntities);

        // When
        when(workingHoursRepository.findAllByIdInAndSupplierId(List.of(workingHours.id()),SUPPLIER_ID)).thenReturn(expectedWorkingHoursEntities);
        when(workingHoursRepository.saveAll(any())).thenReturn(savedWorkingHoursEntities);

        // Then
        List<WorkingHoursDto> savedWorkingHoursDtos = workingHoursService.editAll(inputWorkingHoursDtos, supplier);

        assertEquals(inputWorkingHoursDtos.size(), savedWorkingHoursDtos.size());
    }

    @Test
    public void GivenValidDataWithDifferentIds_WhenEditAll_ThenExpectDtoValidateException() {
        // Given
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);
        WorkingHoursDto workingHours = workingHoursDtoBuilder(1, false);
        List<WorkingHoursDto> inputWorkingHoursDtos = List.of(workingHours);

        // When Then
        assertThrows(DtoValidateException.class, () -> workingHoursService.editAll(inputWorkingHoursDtos, supplier));
    }

    @Test
    public void GivenCallToGetWorkingHoursForSupplier_WorkingHoursDtoShouldBeReturned() {
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);
        List<WorkingHours> mockWorkingHours = List.of(workingHoursBuilder(supplier, AM_5, AM_10, true, 1),
                workingHoursBuilder(supplier, AM_5, AM_10, true, 2));

        when(workingHoursRepository.findAllBySupplierIdOrderByDayAsc(SUPPLIER_ID)).thenReturn(mockWorkingHours);
        List<WorkingHoursDto> workingHoursDtos = workingHoursService.getWorkingHoursForSupplier(SUPPLIER_ID);

        assertNotNull(workingHoursDtos);
        assertEquals(workingHoursDtos.size(), mockWorkingHours.size());
    }

    @Test
    @SneakyThrows
    public void GivenEmptyArray_WhenSaveAll_ShouldReturnEmptyArray() {
        List<WorkingHoursCreateDto> inputWorkingHoursDtos = new ArrayList<>();

        List<WorkingHours> savedWorkingHoursDtos = workingHoursService.createWorkingHours(inputWorkingHoursDtos, Supplier.builder().build());

        assertTrue(savedWorkingHoursDtos.isEmpty());
    }

    @Test
    @SneakyThrows
    public void GivenInvalidInput_WhenSaveAll_ThenExpectDtoValidateException() {
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        List<WorkingHoursCreateDto> inputWorkingHoursDtos = List.of(workingHoursCreateDtoBuilder(true, AM_5, AM_10),
                workingHoursCreateDtoBuilder(true, AM_10, AM_5));

        assertThrows(DtoValidateException.class, () -> workingHoursService.createWorkingHours(inputWorkingHoursDtos, supplier));

    }

    @Test
    @SneakyThrows
    public void GivenValidInput_WhenSaveAll_ThenExpectSuccess() {
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        List<WorkingHoursCreateDto> inputWorkingHoursDtos = List.of(workingHoursCreateDtoBuilder(true, AM_5, AM_10),
                workingHoursCreateDtoBuilder(true, AM_5, AM_10));

        List<WorkingHours> savedWorkingHoursDtos = workingHoursService.createWorkingHours(inputWorkingHoursDtos, supplier);

        assertEquals(inputWorkingHoursDtos.size(), savedWorkingHoursDtos.size());
    }

    @Test
    public void GivenDuplicateDays_WhenCreateWorkingHoursAsAdmin_ThenExpectDtoValidateException() {
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        List<WorkingHoursDto> inputWorkingHoursDtos = List.of(
                workingHoursDtoBuilder(1, true),
                workingHoursDtoBuilder(1, true),
                workingHoursDtoBuilder(2, true),
                workingHoursDtoBuilder(3, true),
                workingHoursDtoBuilder(4, true),
                workingHoursDtoBuilder(5, true),
                workingHoursDtoBuilder(6, true));

        assertThrows(DtoValidateException.class, () -> workingHoursService.createWorkingHoursAsAdmin(inputWorkingHoursDtos, supplier));
    }

    @Test
    public void GivenValidInput_WhenCreateWorkingHoursAsAdmin_ThenExpectSuccess() throws DtoValidateException {
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        List<WorkingHoursDto> inputWorkingHoursDtos = List.of(
                workingHoursDtoBuilder(1, true),
                workingHoursDtoBuilder(2, true),
                workingHoursDtoBuilder(3, true),
                workingHoursDtoBuilder(4, true),
                workingHoursDtoBuilder(5, true),
                workingHoursDtoBuilder(6, true),
                workingHoursDtoBuilder(7, true));


        List<WorkingHours> savedWorkingHoursDtos = workingHoursService.createWorkingHoursAsAdmin(inputWorkingHoursDtos, supplier);

        assertEquals(inputWorkingHoursDtos.size(), savedWorkingHoursDtos.size());
    }

    @Test
    public void GivenMissingDays_WhenCreateWorkingHoursAsAdmin_ThenExpectDtoValidateException() {
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        List<WorkingHoursDto> inputWorkingHoursDtos = List.of(
                workingHoursDtoBuilder(1, true),
                workingHoursDtoBuilder(2, true),
                workingHoursDtoBuilder(3, true),
                workingHoursDtoBuilder(4, true),
                workingHoursDtoBuilder(5, true),
                workingHoursDtoBuilder(6, true));

        assertThrows(DtoValidateException.class, () -> workingHoursService.createWorkingHoursAsAdmin(inputWorkingHoursDtos, supplier));
    }

    @Test
    public void GivenOnlyClosedDays_WhenCreateWorkingHoursAsAdmin_ThenExpectDtoValidateException() throws DtoValidateException {
        Supplier supplier = Supplier.builder().build();
        supplier.setId(SUPPLIER_ID);

        List<WorkingHoursDto> inputWorkingHoursDtos = List.of(
                workingHoursDtoBuilder(1, false),
                workingHoursDtoBuilder(2, false),
                workingHoursDtoBuilder(3, false),
                workingHoursDtoBuilder(4, false),
                workingHoursDtoBuilder(5, false),
                workingHoursDtoBuilder(6, false),
                workingHoursDtoBuilder(7, false));

        assertThrows(DtoValidateException.class, () -> workingHoursService.createWorkingHoursAsAdmin(inputWorkingHoursDtos, supplier));
    }

    private WorkingHours workingHoursBuilder(Supplier supplier, String openTime, String closeTime, boolean isChecked,
                                             int day) {

        return WorkingHours.builder()
                .supplier(supplier)
                .day(day)
                .closeTime(openTime)
                .openTime(closeTime)
                .isChecked(isChecked)
                .build();
    }

    private WorkingHoursDto workingHoursDtoBuilder(int day, boolean isChecked) {

        return WorkingHoursDto.builder()
                .id(UUID.randomUUID())
                .day(day)
                .isChecked(isChecked)
                .openTime(AM_5)
                .closeTime(AM_10)
                .build();
    }

    private WorkingHoursCreateDto workingHoursCreateDtoBuilder(boolean isChecked, String openTime, String closeTime) {

        return WorkingHoursCreateDto.builder()
                .day(1)
                .openTime(openTime)
                .closeTime(closeTime)
                .isChecked(isChecked)
                .build();
    }
}
