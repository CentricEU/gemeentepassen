package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.CsvManipulationException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.CitizenGroupRepository;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.RegistrationService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.util.LocalDateParser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static nl.centric.innovation.local4local.service.impl.PassholderService.ORDER_CRITERIA;
import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceImplTests {

    @InjectMocks
    private RegistrationService registrationService;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private PassholderRepository passholderRepository;

    @Mock
    private PrincipalService principalService;

    @Mock
    private UserService userService;

    @Mock
    private LocalDateParser dateParser;

    @Mock
    private CitizenGroupRepository citizenGroupRepository;

    private static final UUID TENANT_ID = UUID.randomUUID();

    private static final UUID CITIZEN_GROUP_ID = UUID.randomUUID();

    @Test
    void GivenInvalidData_WhenSaveFromCSVFile_ThenExpectDtoValidateException() {
        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);
        String csvContent = """
                name,address,bsn,passNumber,expiringDate,residenceCity
                Dan,str Veche,45454545,1412545,1021/023/2024,Iasi
                """;

        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant1));

        // Then
        assertThrows(DtoValidateException.class, () -> registrationService.saveFromCSVFile(file, CITIZEN_GROUP_ID));

    }

    @Test
    @SneakyThrows
    void GivenValidData_WhenSaveFromCSVFile_ThenExpectSuccess() {
        // Given
        Tenant tenant1 = new Tenant();
        CitizenGroup mockGroup = new CitizenGroup();
        mockGroup.setTenantId(TENANT_ID);
        tenant1.setId(TENANT_ID);
        String csvContent = """
                name,address,bsn,passNumber,expiringDate,residenceCity
                Dan,str Veche,45454545,1412545,02/02/2024,Iasi
                """;

        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        List<Passholder> mockPassholders = Arrays.asList(new Passholder());
        when(passholderRepository.saveAll(anyList())).thenReturn(mockPassholders);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(dateParser.parseDateString(any(String.class))).thenReturn(Optional.of(LocalDate.of(2024, 02, 02)));
        when(citizenGroupRepository.findById(CITIZEN_GROUP_ID)).thenReturn(Optional.of(mockGroup));
        // When
        List<Passholder> result = registrationService.saveFromCSVFile(file, CITIZEN_GROUP_ID);

        // Then
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(passholderRepository, times(1)).saveAll(anyList());
    }

    @Test
    void GivenInvalidTenant_WhenSaveFromCSVFile_ThenExpectThrow() {
        UUID invalidTenantUUID = UUID.randomUUID();

        when(tenantRepository.findById(invalidTenantUUID)).thenReturn(Optional.empty());
        when(principalService.getTenantId()).thenReturn(invalidTenantUUID);

        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv",
                "Column1,Column2\nValue1,Value2\n".getBytes());

        assertThrows(DtoValidateNotFoundException.class, () -> registrationService.saveFromCSVFile(file, CITIZEN_GROUP_ID));

        verify(tenantRepository, times(1)).findById(invalidTenantUUID);
        verify(passholderRepository, never()).saveAll(any());
    }

    @Test
    void GivenValidCSV_WhenSaveFromCSVFile_ThenPassholdersSavedAndUsersCreated() throws Exception {
        // Given
        UUID tenantId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        CitizenGroup group = new CitizenGroup();
        group.setTenantId(tenantId);

        String csvContent = """
            name,address,bsn,passNumber,expiringDate,residenceCity
            John Doe,Main St,123456789,PASS123,02/02/2024,Amsterdam
            """;
        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());

        Passholder passholder = new Passholder();
        passholder.setBsn("123456789");
        passholder.setName("John Doe");
        passholder.setPassNumber("PASS123");

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(citizenGroupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(dateParser.parseDateString(any(String.class))).thenReturn(Optional.of(LocalDate.of(2024, 2, 2)));
        when(passholderRepository.saveAll(anyList())).thenReturn(List.of(passholder));
        doNothing().when(userService).saveCitizens(anyList(), any(String.class));

        // When
        List<Passholder> result = registrationService.saveFromCSVFile(file, groupId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(passholderRepository, times(1)).saveAll(anyList());
        verify(userService, times(1)).saveCitizens(anyList(), eq("nl-NL"));
    }

    @Test
    void GivenInvalidTenant_WhenSaveFromCSVFile_ThenThrowDtoValidateNotFoundException() {
        // Given
        UUID invalidTenantId = UUID.randomUUID();
        when(principalService.getTenantId()).thenReturn(invalidTenantId);
        when(tenantRepository.findById(invalidTenantId)).thenReturn(Optional.empty());
        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", "name,address,bsn,passNumber,expiringDate,residenceCity\n".getBytes());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> registrationService.saveFromCSVFile(file, UUID.randomUUID()));
    }

    @Test
    void GivenInvalidCitizenGroupTenant_WhenSaveFromCSVFile_ThenThrowDtoValidateException() {
        // Given
        UUID tenantId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        CitizenGroup group = new CitizenGroup();
        group.setTenantId(UUID.randomUUID()); // Different tenant

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(citizenGroupRepository.findById(groupId)).thenReturn(Optional.of(group));
        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", "name,address,bsn,passNumber,expiringDate,residenceCity\n".getBytes());

        // Then
        assertThrows(DtoValidateException.class, () -> registrationService.saveFromCSVFile(file, groupId));
    }

    @Test
    void GivenInvalidCSV_WhenSaveFromCSVFile_ThenThrowCsvManipulationException() throws Exception {
        // Given
        UUID tenantId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        CitizenGroup group = new CitizenGroup();
        group.setTenantId(tenantId);

        MultipartFile file = mock(MultipartFile.class);
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(citizenGroupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(file.getInputStream()).thenThrow(new IOException("IO error"));

        // Then
        assertThrows(CsvManipulationException.class, () -> registrationService.saveFromCSVFile(file, groupId));
    }

    @Test
    void GivenDuplicateBSNOrPassNumber_WhenSaveFromCSVFile_ThenThrowErrorToController() throws Exception {
        // Given
        UUID tenantId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        CitizenGroup group = new CitizenGroup();
        group.setTenantId(tenantId);

        String csvContent = """
            name,address,bsn,passNumber,expiringDate,residenceCity
            John Doe,Main St,123456789,PASS123,02/02/2024,Amsterdam
            """;
        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());

        Passholder passholder = new Passholder();
        passholder.setBsn("123456789");
        passholder.setName("John Doe");
        passholder.setPassNumber("PASS123");

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(citizenGroupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(dateParser.parseDateString(any(String.class))).thenReturn(Optional.of(LocalDate.of(2024, 2, 2)));
        when(passholderRepository.saveAll(anyList())).thenThrow(new RuntimeException("Duplicate"));

        // Then
        assertThrows(RuntimeException.class, () -> registrationService.saveFromCSVFile(file, groupId));
    }

    @Test
    void GivenUserServiceFails_WhenSaveFromCSVFile_ThenThrowCsvManipulationException() throws Exception {
        // Given
        UUID tenantId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        CitizenGroup group = new CitizenGroup();
        group.setTenantId(tenantId);

        String csvContent = """
            name,address,bsn,passNumber,expiringDate,residenceCity
            John Doe,Main St,123456789,PASS123,02/02/2024,Amsterdam
            """;
        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());

        Passholder passholder = new Passholder();
        passholder.setBsn("123456789");
        passholder.setName("John Doe");
        passholder.setPassNumber("PASS123");

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(citizenGroupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(dateParser.parseDateString(any(String.class))).thenReturn(Optional.of(LocalDate.of(2024, 2, 2)));
        when(passholderRepository.saveAll(anyList())).thenReturn(List.of(passholder));
        doThrow(new RuntimeException("User creation failed")).when(userService).saveCitizens(anyList(), any(String.class));

        // Then
        assertThrows(CsvManipulationException.class, () -> registrationService.saveFromCSVFile(file, groupId));
    }

}
