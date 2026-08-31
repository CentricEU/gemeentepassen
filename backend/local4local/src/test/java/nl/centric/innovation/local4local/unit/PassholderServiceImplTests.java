package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.FilterPassholdersRequestDto;
import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.CitizenBenefitService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static nl.centric.innovation.local4local.service.impl.PassholderService.ORDER_CRITERIA;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PassholderServiceImplTests {

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final UUID PASSHOLDER_ID = UUID.randomUUID();
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
        when(passholderRepository.findByIdAndTenantId(passholderId, TENANT_ID)).thenReturn(Optional.of(Passholder.passholderViewDtoToEntity(inputDto, tenant1)));
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
    void givenExistingPassholder_whenGetPassholderDetails_thenReturnViewDto() throws DtoValidateNotFoundException {
        // Given
        Passholder passholder = Passholder.builder().address("randomAddress").bsn("randomBSN")
                .name("randomName").passNumber("randomPassNo").residenceCity("residenceCity")
                .expiringDate(LocalDate.now()).tenant(new Tenant()).build();
        passholder.setId(PASSHOLDER_ID);

        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID))
                .thenReturn(Optional.of(passholder));

        // When
        PassholderViewDto result =
                passholderService.getPassholderDetails(PASSHOLDER_ID);

        // Then
        assertNotNull(result);
        // Optional: verify mapping fields if deterministic
        verify(passholderRepository)
                .findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID);
    }

    @Test
    void givenPassholderNotFound_whenGetPassholderDetails_thenThrowNotFoundException() {
        // Given
        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID))
                .thenReturn(Optional.empty());

        // When + Then
        assertThrows(
                DtoValidateNotFoundException.class,
                () -> passholderService.getPassholderDetails(PASSHOLDER_ID)
        );

        verify(passholderRepository)
                .findByIdAndTenantId(PASSHOLDER_ID, TENANT_ID);
    }

    @Test
    void GivenFilterParams_WhenGetFilteredPassholders_ThenDtosReturned() {
        // Given
        FilterPassholdersRequestDto filterParams = new FilterPassholdersRequestDto("123456789", "AbC987");
        Pageable pageable = PageRequest.of(0, 10, Sort.by(ORDER_CRITERIA));
        Passholder mockPassholder = Passholder.builder().address("address").bsn("123456789")
                .name("randomName").passNumber("AbC987").residenceCity("residenceCity")
                .expiringDate(LocalDate.now()).tenant(new Tenant()).build();
        mockPassholder.setId(UUID.randomUUID());
        mockPassholder.setCitizenGroup(CitizenGroup.builder().groupName("groupName").build());

        Page<Passholder> passholderPage = new PageImpl<>(List.of(mockPassholder));
        String expectedBsn = "%123456789%";
        String expectedPassNumber = "%abc987%";

        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.findAllByFilterCriteria(eq(TENANT_ID), eq(expectedBsn), eq(expectedPassNumber), eq(pageable)))
                .thenReturn(passholderPage);

        // When
        List<PassholderViewDto> result = passholderService.getFilteredPassholders(filterParams, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(passholderRepository, times(1)).findAllByFilterCriteria(eq(TENANT_ID), eq(expectedBsn), eq(expectedPassNumber), eq(pageable));
    }

    @Test
    void GivenFilterParams_WhenCountFilteredPassholders_ThenCountReturned() {
        // Given
        FilterPassholdersRequestDto filterParams = new FilterPassholdersRequestDto("123456789", "AbC987");
        String expectedBsn = "%123456789%";
        String expectedPassNumber = "%abc987%";

        when(principalService.getTenantId()).thenReturn(TENANT_ID);
        when(passholderRepository.countAllByFilterCriteria(eq(TENANT_ID), eq(expectedBsn), eq(expectedPassNumber))).thenReturn(5);

        // When
        Integer result = passholderService.countFilteredPassholders(filterParams);

        // Then
        assertEquals(5, result);
        verify(passholderRepository, times(1)).countAllByFilterCriteria(eq(TENANT_ID), eq(expectedBsn), eq(expectedPassNumber));
    }
}
