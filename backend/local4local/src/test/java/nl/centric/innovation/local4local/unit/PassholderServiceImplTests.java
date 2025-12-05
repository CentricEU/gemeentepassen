package nl.centric.innovation.local4local.unit;

import static nl.centric.innovation.local4local.service.impl.PassholderService.ORDER_CRITERIA;
import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import nl.centric.innovation.local4local.dto.AssignPassholderGrantsDto;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.service.impl.GrantService;
import nl.centric.innovation.local4local.service.impl.PassholderService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
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

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.LocalDateParser;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
public class PassholderServiceImplTests {

    @InjectMocks
    private PassholderService passholderService;

    @Mock
    private TenantService tenantService;

    @Mock
    private PassholderRepository passholderRepository;

    @Mock
    private PrincipalService princiaplService;

    @Mock
    private GrantService grantService;

    @Mock
    private LocalDateParser dateParser;

    private static final UUID TENANT_ID = UUID.randomUUID();

    @Test
    public void GivenInvalidData_WhenSaveFromCSVFile_ThenExpectDtoValidateException() {
        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);
        String csvContent = """
                name,address,bsn,passNumber,expiringDate,residenceCity
                Dan,str Veche,45454545,1412545,1021/023/2024,Iasi
                """;

        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());
        when(princiaplService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantService.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(dateParser.parseDateString(any(String.class))).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateException.class, () -> passholderService.saveFromCSVFile(file));

    }

    @Test
    @SneakyThrows
    public void GivenValidData_WhenSaveFromCSVFile_ThenExpectSuccess() {
        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);
        String csvContent = """
                name,address,bsn,passNumber,expiringDate,residenceCity
                Dan,str Veche,45454545,1412545,02/02/2024,Iasi
                """;

        MultipartFile file = new MockMultipartFile("data.csv", "filename.csv", "text/plain", csvContent.getBytes());
        when(princiaplService.getTenantId()).thenReturn(TENANT_ID);
        List<Passholder> mockPassholders = Arrays.asList(new Passholder());
        when(passholderRepository.saveAll(anyList())).thenReturn(mockPassholders);
        when(tenantService.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(dateParser.parseDateString(any(String.class))).thenReturn(Optional.of(LocalDate.of(2024, 02, 02)));
        // When
        List<Passholder> result = passholderService.saveFromCSVFile(file);

        // Then
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(passholderRepository, times(1)).saveAll(anyList());
    }

    @Test
    public void GivenInvalidTenant_WhenSaveFromCSVFile_ThenExpectThrow() {
        UUID invalidTenantUUID = UUID.randomUUID();

        when(tenantService.findByTenantId(invalidTenantUUID)).thenReturn(Optional.empty());
        when(princiaplService.getTenantId()).thenReturn(invalidTenantUUID);

        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv",
                "Column1,Column2\nValue1,Value2\n".getBytes());

        assertThrows(DtoValidateNotFoundException.class, () -> passholderService.saveFromCSVFile(file));

        verify(tenantService, times(1)).findByTenantId(invalidTenantUUID);
        verify(passholderRepository, never()).saveAll(any());
    }

    @Test
    @SneakyThrows
    public void GivenValid_WhenGetAll_ThenPassholdersViewDtosReturned() {
        // Given
        Passholder pass1 = Passholder.builder().address("randomAddress").bsn("randomBSN").grants(List.of())
                .name("randomName").passNumber("randomPassNo").residenceCity("residenceCity")
                .expiringDate(LocalDate.now()).tenant(new Tenant()).build();
        pass1.setId(UUID.randomUUID());

        Passholder pass2 = Passholder.builder().address("randomAddress").bsn("randomBSN").grants(List.of())
                .name("randomName").passNumber("randomPassNo").residenceCity("residenceCity")
                .expiringDate(LocalDate.now()).tenant(new Tenant()).build();
        pass2.setId(UUID.randomUUID());

        List<Passholder> mockPassholderList = List.of(pass1, pass2);

        Page<Passholder> mockPassholderPage = new PageImpl<>(mockPassholderList);
        Pageable pageable = PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA));

        // When
        when(princiaplService.getTenantId()).thenReturn(TENANT_ID);

        when(passholderRepository.findAllByTenantId(TENANT_ID, pageable)).thenReturn(mockPassholderPage);

        List<PassholderViewDto> passholderViewDtos = passholderService.getAll(0, 25);

        // Then
        assertNotNull(passholderViewDtos);
        assertEquals(mockPassholderList.size(), passholderViewDtos.size());
    }

    @Test
    @SneakyThrows
    public void GivenValid_WhenCountByTenantId_ThenShouldCount() {

        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        // When
        when(princiaplService.getTenantId()).thenReturn(TENANT_ID);

        when(passholderRepository.countByTenantId(TENANT_ID)).thenReturn(2);

        Integer count = passholderService.countAll();

        assertEquals(2, count);
    }

    @Test
    @SneakyThrows
    public void GivenValid_WhenUpdatePassholder_ThenShouldReturn() {
        Tenant tenant1 = new Tenant();
        tenant1.setId(TENANT_ID);

        UUID passholderId = UUID.randomUUID();
        PassholderViewDto inputDto = PassholderViewDto.builder().address("randomAddress").bsn("randomBSN")
                .grants(List.of()).name("randomName").passNumber("randomPassNo").residenceCity("residenceCity")
                .id(passholderId).expiringDate(LocalDate.now()).isRegistered(false).build();


        when(princiaplService.getTenantId()).thenReturn(TENANT_ID);
        when(tenantService.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant1));
        when(passholderRepository.save(any(Passholder.class))).thenAnswer(invocation -> {
            Passholder savedPassholder = invocation.getArgument(0);
            return savedPassholder;
        });

        PassholderViewDto resultDto = passholderService.updatePassholder(inputDto);
        verify(passholderRepository, times(1)).save(any(Passholder.class));

        assertEquals(inputDto.id(), resultDto.id());

    }

    @Test
    public void GivenExistingPassholder_WhenDeletePassholder_ThenPassholderIsDeleted() throws DtoValidateNotFoundException {
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
    public void GivenNonExistingPassholder_WhenDeletePassholder_ThenExceptionThrown() {
        // Given
        UUID passholderId = UUID.randomUUID();

        // When
        when(passholderRepository.findById(passholderId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> passholderService.deletePassholder(passholderId));
    }
    
    @Test
    public void GivenAssignPassholders_WhenValidAssignPassholderGrantsDto_ThenReturnListOfPassholderViewDto() throws DtoValidateNotFoundException {
        // Given
        UUID grant1Id = UUID.randomUUID();
        UUID grant2Id = UUID.randomUUID();
        UUID passholderId = UUID.randomUUID();
        AssignPassholderGrantsDto assignPassholderGrantsDto = AssignPassholderGrantsDto.builder().grantsIds(Set.of(grant1Id, grant2Id)).passholderIds(Arrays.asList(passholderId)).build();

        Grant grant1 = new Grant();
        grant1.setId(grant1Id);
        Grant grant2 = new Grant();
        grant2.setId(grant2Id);
        Set<Grant> grantsToAssign = new HashSet<>(Arrays.asList(grant1, grant2));

        Passholder passholder1 = Passholder.builder().grants(Arrays.asList(grant1)).address("test").bsn("test").name("test").passNumber("test").residenceCity("test").expiringDate(LocalDate.now()).build();
        passholder1.setId(passholderId);

        List<Passholder> passholders = Arrays.asList(passholder1);

        when(grantService.getAllInIds(anySet())).thenReturn(grantsToAssign);
        when(passholderRepository.findAllById(anyList())).thenReturn(passholders);
        when(passholderRepository.saveAll(any())).thenReturn(passholders);

        // When
        List<PassholderViewDto> result = passholderService.assignPassholders(assignPassholderGrantsDto);

        // Then
        assertEquals(1, result.size());
        verify(grantService, times(1)).getAllInIds(assignPassholderGrantsDto.grantsIds());
        verify(passholderRepository, times(1)).findAllById(assignPassholderGrantsDto.passholderIds());
        verify(passholderRepository, times(1)).saveAll(passholders);
    }

    @Test
    @SneakyThrows
    public void GivenValidPassNumber_WhenGetPassholderByPassNumber_ThenReturnPassholder() {
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
    public void GivenInvalidPassNumber_WhenGetPassholderByPassNumber_ThenThrowException() {
        // Given
        String passNumber = "invalidPassNumber";

        // When
        when(passholderRepository.findByPassNumber(passNumber)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> passholderService.getPassholderByPassNumber(passNumber));
    }

    @Test
    public void GivenValidPassholderAndUser_WhenSaveUserForPassholder_ThenUserIsSaved() {
        // Given
        UUID passholderId = UUID.randomUUID();
        Passholder mockPassholder = new Passholder();
        mockPassholder.setId(passholderId);
        User mockUser = new User();
        mockUser.setId(UUID.randomUUID());

        // when
        passholderService.saveUserForPassholder(mockPassholder, mockUser);

        // Then
        verify(passholderRepository, times(1)).save(mockPassholder);
        assertEquals(mockUser, mockPassholder.getUser());
    }
}
