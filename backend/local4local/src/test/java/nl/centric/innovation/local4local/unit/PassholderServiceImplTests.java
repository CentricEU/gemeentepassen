package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.CitizenGroupRepository;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.CitizenBenefitService;
import nl.centric.innovation.local4local.service.impl.PassholderService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.util.LocalDateParser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PassholderServiceImplTests {

    @InjectMocks
    private PassholderService passholderService;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private PassholderRepository passholderRepository;

    @Mock
    private PrincipalService principalService;

    @Mock
    private CitizenBenefitService citizenBenefitService;

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
        assertThrows(DtoValidateException.class, () -> passholderService.saveFromCSVFile(file, CITIZEN_GROUP_ID));

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
        List<Passholder> result = passholderService.saveFromCSVFile(file, CITIZEN_GROUP_ID);

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

        assertThrows(DtoValidateNotFoundException.class, () -> passholderService.saveFromCSVFile(file, CITIZEN_GROUP_ID));

        verify(tenantRepository, times(1)).findById(invalidTenantUUID);
        verify(passholderRepository, never()).saveAll(any());
    }

    @Test
    @SneakyThrows
    void GivenValid_WhenGetAll_ThenPassholdersViewDtosReturned() {
        // Given
        CitizenGroup mockGroup = CitizenGroup.builder().groupName("groupName").build();
        Passholder pass1 = Passholder.builder().address("randomAddress").bsn("randomBSN")
                .name("randomName").passNumber("randomPassNo").residenceCity("residenceCity")
                .expiringDate(LocalDate.now()).tenant(new Tenant()).build();
        pass1.setId(UUID.randomUUID());
        pass1.setCitizenGroup(mockGroup);

        Passholder pass2 = Passholder.builder().address("randomAddress").bsn("randomBSN")
                .name("randomName").passNumber("randomPassNo").residenceCity("residenceCity")
                .expiringDate(LocalDate.now()).tenant(new Tenant()).build();
        pass2.setId(UUID.randomUUID());
        pass2.setCitizenGroup(mockGroup);

        List<Passholder> mockPassholderList = List.of(pass1, pass2);

        Page<Passholder> mockPassholderPage = new PageImpl<>(mockPassholderList);
        Pageable pageable = PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA));

        // When
        when(principalService.getTenantId()).thenReturn(TENANT_ID);

        when(passholderRepository.findAllByTenantIdOrderByCreatedDateDesc(TENANT_ID, pageable)).thenReturn(mockPassholderPage);

        List<PassholderViewDto> passholderViewDtos = passholderService.getAll(0, 25);

        // Then
        assertNotNull(passholderViewDtos);
        assertEquals(mockPassholderList.size(), passholderViewDtos.size());
    }

    @Test
    @SneakyThrows
    void GivenValid_WhenCountByTenantId_ThenShouldCount() {

        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        // When
        when(principalService.getTenantId()).thenReturn(TENANT_ID);

        when(passholderRepository.countByTenantId(TENANT_ID)).thenReturn(2);

        Integer count = passholderService.countAll();

        assertEquals(2, count);
    }

    @Test
    @SneakyThrows
    void GivenValid_WhenUpdatePassholder_ThenShouldReturn() {
        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        UUID passholderId = UUID.randomUUID();
        PassholderViewDto inputDto = PassholderViewDto.builder().address("randomAddress").bsn("randomBSN")
                .name("randomName").passNumber("randomPassNo").residenceCity("residenceCity")
                .id(passholderId).expiringDate(LocalDate.now()).isRegistered(false)
                .citizenGroupName("groupName").build();

        // When
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.findById(passholderId)).thenReturn(Optional.of(Passholder.passholderViewDtoToEntity(inputDto, tenant1)));
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(passholderRepository.save(any(Passholder.class))).thenAnswer(invocation -> {
            Passholder savedPassholder = invocation.getArgument(0);
            savedPassholder.setId(passholderId);
            return savedPassholder;
        });

        // Then
        PassholderViewDto resultDto = passholderService.updatePassholder(inputDto);
        verify(passholderRepository, times(1)).save(any(Passholder.class));

        assertEquals(inputDto.id(), resultDto.id());

    }

    @Test
    void GivenExistingPassholder_WhenDeletePassholder_ThenPassholderIsDeleted() throws DtoValidateNotFoundException {
        // Given
        UUID passholderId = UUID.randomUUID();
        Passholder mockPassholder = new Passholder();
        mockPassholder.setId(passholderId);

        when(passholderRepository.findById(passholderId)).thenReturn(Optional.of(mockPassholder));

        // When
        passholderService.deletePassholder(passholderId);

        // Then
        verify(passholderRepository, times(1)).deleteById(passholderId);
    }

    @Test
    void GivenNonExistingPassholder_WhenDeletePassholder_ThenExceptionThrown() {
        // Given
        UUID passholderId = UUID.randomUUID();

        // When
        when(passholderRepository.findById(passholderId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> passholderService.deletePassholder(passholderId));
    }

    @Test
    @SneakyThrows
    void GivenValidPassNumber_WhenGetPassholderByPassNumber_ThenReturnPassholder() {
        // Given
        UUID passholderId = UUID.randomUUID();
        Passholder mockPassholder = new Passholder();
        mockPassholder.setId(passholderId);
        String passNumber = "validPassNumber";

        // When
        when(passholderRepository.findByPassNumber(passNumber)).thenReturn(Optional.of(mockPassholder));
        Passholder result = passholderService.getPassholderByPassNumber(passNumber);

        // Then
        assertNotNull(result);
        assertEquals(passholderId, result.getId());
    }

    @Test
    void GivenInvalidPassNumber_WhenGetPassholderByPassNumber_ThenThrowException() {
        // Given
        String passNumber = "invalidPassNumber";

        // When
        when(passholderRepository.findByPassNumber(passNumber)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> passholderService.getPassholderByPassNumber(passNumber));
    }

    @Test
    void GivenValidPassholderAndUser_WhenSaveUserForPassholder_ThenUserIsSaved() {
        // Given
        UUID passholderId = UUID.randomUUID();
        Passholder mockPassholder = new Passholder();
        CitizenGroup mockGroup = new CitizenGroup();
        mockPassholder.setCitizenGroup(mockGroup);
        mockPassholder.setId(passholderId);
        mockPassholder.setCitizenGroup(CitizenGroup.builder().benefits(Set.of(new Benefit())).build());
        User mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        doNothing().when(citizenBenefitService).createCitizenBenefitForUserIdAndBenefits(any(), any());

        // when
        passholderService.saveUserForPassholder(mockPassholder, mockUser);

        // Then
        verify(passholderRepository, times(1)).save(mockPassholder);
        assertEquals(mockUser, mockPassholder.getUser());
    }

    @Test
    void GivenMissingRequiredField_WhenSaveFromCSVFile_ThenExpectDtoValidateException() {
        // Given
        Tenant tenant = new Tenant();
        tenant.setId(TENANT_ID);

        String csvContent = """
                name,address,bsn,passNumber,expiringDate,residenceCity
                Dan,str Veche,,1412545,02/02/2024,Iasi
                """;

        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());

        // When
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));

        // Then & Verify
        assertThrows(DtoValidateException.class, () -> passholderService.saveFromCSVFile(file, CITIZEN_GROUP_ID));
    }

}
