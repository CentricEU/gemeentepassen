package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.CitizenGroupDto;
import nl.centric.innovation.local4local.dto.CitizenGroupViewDto;
import nl.centric.innovation.local4local.entity.*;
import nl.centric.innovation.local4local.enums.CitizenAgeGroup;
import nl.centric.innovation.local4local.enums.EligibilityCriteria;
import nl.centric.innovation.local4local.enums.RequiredDocuments;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.GroupCitizenAssignmentRepository;
import nl.centric.innovation.local4local.repository.CitizenGroupRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.service.impl.CitizenGroupService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static nl.centric.innovation.local4local.service.impl.CitizenGroupService.ORDER_CRITERIA;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitizenGroupServiceTests {

    @Mock
    private CitizenGroupRepository citizenGroupRepository;

    @InjectMocks
    private CitizenGroupService citizenGroupService;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private GroupCitizenAssignmentRepository categoryAssignmentRepository;

    private final UUID CITIZEN_GROUP_ID = UUID.randomUUID();

    private static final UUID VALID_TENANT_ID = UUID.fromString("49e4c8e8-8956-11ee-b9d1-0242ac120002");

    @Mock
    private PrincipalService principalService;

    @Mock
    private EmailService emailService;

    @Test
    void save_ShouldSaveCitizenGroup() throws DtoValidateException {
        // Given
        CitizenGroupDto dto = new CitizenGroupDto(
                "Group A",
                new CitizenAgeGroup[]{CitizenAgeGroup.AGE_18_64},
                false,
                BigDecimal.valueOf(100),
                BigDecimal.valueOf(494.08),
                new EligibilityCriteria[]{EligibilityCriteria.HAS_EXISTING_DIGID},
                new RequiredDocuments[]{RequiredDocuments.ASSETS}
        );

        UUID tenantId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setWage(494.08);

        CitizenGroup entity = CitizenGroup.fromDto(dto, tenantId);

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(citizenGroupRepository.save(any(CitizenGroup.class))).thenReturn(entity);

        citizenGroupService.save(dto);

        // Verify
        verify(citizenGroupRepository).save(any(CitizenGroup.class));
    }

    @Test
    void givenCitizenUser_WhenGetAllByTenantId_ThenOnlyGroupsWithBenefitsReturned() {
        // Given
        List<CitizenGroup> mockCitizenGroupList = List.of(citizenGroupBuilder(), citizenGroupBuilder());

        Role citizenRole = new Role();
        citizenRole.setName(Role.ROLE_CITIZEN);
        User mockUser = new User();
        mockUser.setRole(citizenRole);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(citizenGroupRepository.findAllByTenantIdAndBenefitsIsNotEmpty(VALID_TENANT_ID))
                .thenReturn(mockCitizenGroupList);

        // When
        List<CitizenGroupViewDto> citizenGroupViewDtos = citizenGroupService.getAllByTenantId();

        // Verify
        assertNotNull(citizenGroupViewDtos);
        assertEquals(mockCitizenGroupList.size(), citizenGroupViewDtos.size());
    }

    @Test
    void givenNonCitizenUser_WhenGetAllByTenantId_ThenAllGroupsReturned() {
        // Given
        List<CitizenGroup> mockCitizenGroupList = List.of(citizenGroupBuilder(), citizenGroupBuilder());

        Role adminRole = new Role();
        adminRole.setName(Role.ROLE_MUNICIPALITY_ADMIN);
        User mockUser = new User();
        mockUser.setRole(adminRole);

        when(principalService.getUser()).thenReturn(mockUser);
        when(principalService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(citizenGroupRepository.findAllByTenantId(VALID_TENANT_ID))
                .thenReturn(mockCitizenGroupList);

        // When
        List<CitizenGroupViewDto> citizenGroupViewDtos = citizenGroupService.getAllByTenantId();

        // Verify
        assertNotNull(citizenGroupViewDtos);
        assertEquals(mockCitizenGroupList.size(), citizenGroupViewDtos.size());
    }


    @Test
    void save_ShouldThrowDataIntegrityViolationException_WhenRepositoryFails() {
        // Given
        CitizenGroupDto dto = new CitizenGroupDto(
                "Group A",
                new CitizenAgeGroup[]{CitizenAgeGroup.AGE_18_64},
                false,
                BigDecimal.valueOf(100),
                BigDecimal.valueOf(494.08),
                new EligibilityCriteria[]{EligibilityCriteria.HAS_EXISTING_DIGID},
                new RequiredDocuments[]{RequiredDocuments.ASSETS}
        );

        UUID tenantId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setWage(494.08);

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(citizenGroupRepository.save(any(CitizenGroup.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate key"));

        org.junit.jupiter.api.Assertions.assertThrows(
                DataIntegrityViolationException.class,
                () -> citizenGroupService.save(dto)
        );

        // Verify
        verify(citizenGroupRepository).save(any(CitizenGroup.class));
    }

    @Test
    void GivenValid_WhenGetAllPaginated_ThenListOfCitizenGroupsViewDtoTableReturned() {
        // Given
        List<CitizenGroup> mockCitizenGroupList = List.of(citizenGroupBuilder(), citizenGroupBuilder());
        Page<CitizenGroup> mockCitizenGroupPage = new PageImpl<>(mockCitizenGroupList);
        Pageable pageable = PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA).descending());

        // When
        when(principalService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(citizenGroupRepository.findAllByTenantId(VALID_TENANT_ID, pageable)).thenReturn(mockCitizenGroupPage);

        List<CitizenGroupViewDto> citizenGroupViewDtos = citizenGroupService.getAllByTenantIdPaginated(0, 25);

        // Verify
        assertNotNull(citizenGroupViewDtos);
        assertEquals(mockCitizenGroupList.size(), citizenGroupViewDtos.size());
    }

    @Test
    void GivenValid_WhenCount_ThenShouldCount() {
        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(VALID_TENANT_ID);

        // When
        when(principalService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(citizenGroupRepository.countAllByTenantId(VALID_TENANT_ID)).thenReturn(2);

        long count = citizenGroupService.countAllByTenantId();

        // Verify
        assertEquals(2, count);
    }

    @Test
    void GivenInvalidMaxIncome_WhenSave_ThenThrowDtoValidateException() {
        // Given
        CitizenGroupDto dto = new CitizenGroupDto(
                "Group A",
                new CitizenAgeGroup[]{CitizenAgeGroup.AGE_18_64},
                false,
                BigDecimal.valueOf(100),     // threshold percentage
                BigDecimal.valueOf(0),       // deliberately invalid maxIncome
                new EligibilityCriteria[]{EligibilityCriteria.HAS_EXISTING_DIGID},
                new RequiredDocuments[]{RequiredDocuments.ASSETS}
        );

        UUID tenantId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setWage(494.08); // so expected income = 494.08

        // When
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        // Then
        DtoValidateException exception = org.junit.jupiter.api.Assertions.assertThrows(
                DtoValidateException.class,
                () -> citizenGroupService.save(dto)
        );

        assertEquals(
                "Invalid max income. Expected: €494.08, Provided: €0.00",
                exception.getMessage()
        );
    }

    @Test
    @SneakyThrows
    void GivenValidCategoryId_WhenAssignCitizenGroupToCitizen_ThenSaveCategoryAssignment() {
        // Given
        UUID categoryId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        CitizenGroup citizenGroup = new CitizenGroup();
        citizenGroup.setId(categoryId);
        citizenGroup.setTenantId(tenantId);

        // Mock principalService
        when(principalService.getTenantId()).thenReturn(tenantId);

        User mockUser = mock(User.class);
        UUID userId = UUID.randomUUID();
        when(mockUser.getId()).thenReturn(userId);
        when(principalService.getUser()).thenReturn(mockUser);

        when(citizenGroupRepository.findById(categoryId)).thenReturn(Optional.of(citizenGroup));

        // When
        citizenGroupService.assignCitizenGroupToCitizen(categoryId);

        // Verify
        verify(citizenGroupRepository).findById(categoryId);
        ArgumentCaptor<CitizenGroupAssignment> captor = ArgumentCaptor.forClass(CitizenGroupAssignment.class);
        verify(categoryAssignmentRepository).save(captor.capture());

        CitizenGroupAssignment capturedAssignment = captor.getValue();
        assertEquals(userId, capturedAssignment.getCitizenId());
    }

    @Test
    @SneakyThrows
    void GivenValidAssignment_WhenGetAllRequiredDocuments_ThenReturnRequiredDocuments() {
        // Given
        UUID citizenId = UUID.randomUUID();
        CitizenGroup citizenGroup = new CitizenGroup();

        User mockUser = mock(User.class);
        when(mockUser.getId()).thenReturn(citizenId);
        when(principalService.getUser()).thenReturn(mockUser);

        CitizenGroupAssignment assignment = new CitizenGroupAssignment();
        assignment.setCitizenId(citizenId);
        assignment.setCitizenGroup(citizenGroup);

        citizenGroup.setRequiredDocuments(new RequiredDocuments[]{RequiredDocuments.ASSETS, RequiredDocuments.PROOF_OF_IDENTITY});

        // When
        when(categoryAssignmentRepository.findByCitizenId(citizenId)).thenReturn(Optional.of(assignment));
       // when(citizenGroupRepository.findById(groupId)).thenReturn(Optional.of(citizenGroup));

        List<RequiredDocuments> requiredDocuments = citizenGroupService.getAllRequiredDocuments();

        // Verify
        assertNotNull(requiredDocuments);
        assertEquals(2, requiredDocuments.size());
        assertEquals(RequiredDocuments.ASSETS, requiredDocuments.get(0));
        assertEquals(RequiredDocuments.PROOF_OF_IDENTITY, requiredDocuments.get(1));
    }

    @Test
    void GivenNoAssignment_WhenGetAllRequiredDocuments_ThenThrowDtoValidateNotFoundException() {
        // Given
        UUID citizenId = UUID.randomUUID();
        User mockUser = mock(User.class);
        when(mockUser.getId()).thenReturn(citizenId);
        when(principalService.getUser()).thenReturn(mockUser);

        // When
        when(categoryAssignmentRepository.findByCitizenId(citizenId)).thenReturn(Optional.empty());

        // Then
        org.junit.jupiter.api.Assertions.assertThrows(
                nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException.class,
                () -> citizenGroupService.getAllRequiredDocuments()
        );
    }

    @Test
    void GivenValidMessage_WhenSendCitizenMessage_ThenEmailServiceShouldBeCalled() throws Exception {
        // Given
        String message = "Test citizen message";
        String language = "nl";

        Tenant tenant = new Tenant();
        tenant.setEmail("tenant@example.com");

        UUID tenantId = UUID.randomUUID();
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        // Setăm URL-ul prin reflection
        org.springframework.test.util.ReflectionTestUtils.setField(citizenGroupService,
                "baseMunicipalityUrl", "http://municipality.example.com");

        // When
        citizenGroupService.sendCitizenMessage(message);

        // Then
        verify(emailService).sendNoCategoryEmail("http://municipality.example.com", "tenant@example.com", language, message);
    }

    @Test
    void GivenNoTenant_WhenSendCitizenMessage_ThenThrowDtoValidateNotFoundException() {
        // Given
        String message = "Test citizen message";
        String language = "en";

        UUID tenantId = UUID.randomUUID();
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        // When / Then
        org.junit.jupiter.api.Assertions.assertThrows(
                nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException.class,
                () -> citizenGroupService.sendCitizenMessage(message)
        );
    }

    private CitizenGroup citizenGroupBuilder() {
        CitizenGroup citizenGroup = CitizenGroup.builder()
                .groupName("Group A")
                .ageGroup(new CitizenAgeGroup[]{CitizenAgeGroup.AGE_18_64})
                .dependentChildrenIncluded(false)
                .thresholdAmount(BigDecimal.valueOf(100))
                .maxIncome(BigDecimal.valueOf(1000))
                .eligibilityCriteria(new EligibilityCriteria[]{EligibilityCriteria.HAS_EXISTING_DIGID})
                .requiredDocuments(new RequiredDocuments[]{RequiredDocuments.ASSETS})
                .build();
        citizenGroup.setId(CITIZEN_GROUP_ID);
        return citizenGroup;
    }
}