package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.BenefitRequestDto;
import nl.centric.innovation.local4local.dto.BenefitResponseDto;
import nl.centric.innovation.local4local.dto.BenefitTableDto;
import nl.centric.innovation.local4local.dto.EligibleBenefitDto;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.CitizenBenefit;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.CitizenGroupAssignment;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.BenefitStatusEnum;
import nl.centric.innovation.local4local.enums.CitizenAgeGroup;
import nl.centric.innovation.local4local.enums.EligibilityCriteria;
import nl.centric.innovation.local4local.enums.RequiredDocuments;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.BenefitRepository;
import nl.centric.innovation.local4local.repository.GroupCitizenAssignmentRepository;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.service.impl.BenefitService;
import nl.centric.innovation.local4local.service.impl.CitizenBenefitService;
import nl.centric.innovation.local4local.service.impl.CitizenGroupService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.junit.jupiter.api.Assertions;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BenefitServiceTests {
    @Mock
    private BenefitRepository benefitRepository;

    @Mock
    private GroupCitizenAssignmentRepository groupCitizenAssignmentRepository;

    @Mock
    private PassholderRepository passholderRepository;

    @Mock
    private CitizenBenefitService citizenBenefitService;

    @InjectMocks
    private BenefitService benefitService;

    @Mock
    private CitizenGroupService citizenGroupService;

    @Mock
    private PrincipalService principalService;

    UUID tenantId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();

    @Test
    void save_ShouldCreateBenefit_WhenValidData() throws DtoValidateException {
        // Given
        BenefitRequestDto dto = new BenefitRequestDto(
                "Benefit A",
                "Description of Benefit A",
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                20.00,
                Set.of(UUID.randomUUID(), UUID.randomUUID())
        );

        User mockUser = new User();
        mockUser.setId(userId);

        // When
        when(benefitRepository.save(any(Benefit.class))).thenAnswer(invocation -> {
            Benefit benefit = invocation.getArgument(0);
            if (benefit.getId() == null) {
                benefit.setId(UUID.randomUUID());
            }
            return benefit;
        });
        when(principalService.getTenantId()).thenReturn(tenantId);
        Set<CitizenGroup> mockCitizenGroupsList = Set.of(citizenGroupBuilder(), citizenGroupBuilder());
        when(citizenGroupService.getAllByIdsAndTenantId(dto.citizenGroupIds(), tenantId)).thenReturn(mockCitizenGroupsList);
        when(passholderRepository.findAllByUserNotNullAndCitizenGroupIn(any()))
                .thenReturn(List.of(
                        Passholder.builder().name("Test Passholder").user(mockUser).build()));
        benefitService.createBenefit(dto);

        // Verify
        verify(benefitRepository).save(any(Benefit.class));
    }

    @Test
    void GivenNullIds_WhenCreateOffer_ThenExpectError() {
        BenefitRequestDto dto = new BenefitRequestDto(
                "Benefit A",
                "Description of Benefit A",
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                20.00,
                null
        );
        when(principalService.getTenantId()).thenReturn(tenantId);
        assertThrows(NullPointerException.class, () -> benefitService.createBenefit(dto));
    }

    @Test
    void shouldThrowException_WhenCitizenGroupAssignmentNotFound() {
        // Given
        User mockUser = new User();
        mockUser.setId(userId);

        when(principalService.getUser()).thenReturn(mockUser);
        when(groupCitizenAssignmentRepository.findByCitizenId(userId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class,
                () -> benefitService.getAllBenefitsDtoForCitizenGroup());
    }

    @Test
    void shouldReturnEmptyList_WhenCitizenGroupHasNoBenefits() throws DtoValidateNotFoundException {
        // Given
        User mockUser = new User();
        mockUser.setId(userId);

        CitizenGroup group = CitizenGroup.builder().benefits(Collections.emptySet()).build();
        CitizenGroupAssignment assignment = CitizenGroupAssignment.builder().citizenGroup(group).build();

        when(principalService.getUser()).thenReturn(mockUser);
        when(groupCitizenAssignmentRepository.findByCitizenId(userId)).thenReturn(Optional.of(assignment));

        // When
        List<EligibleBenefitDto> result = benefitService.getAllBenefitsDtoForCitizenGroup();

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertTrue(result.isEmpty());
    }

    @Test
    void shouldReturnPagedBenefits_WhenGetAllBenefitsForTenant() {
        // Given
        int page = 0;
        int size = 2;
        Pageable pageable = PageRequest.of(page, size, Sort.by(BenefitService.ORDER_CRITERIA).descending());
        Benefit benefit1 = Benefit.builder()
                .name("Benefit 1")
                .description("Description 1")
                .startDate(LocalDate.now())
                .expirationDate(LocalDate.now().plusDays(10))
                .citizenGroups(Collections.emptySet())
                .build();
        benefit1.setId(UUID.randomUUID());
        Benefit benefit2 = Benefit.builder()
                .name("Benefit 2")
                .description("Description 2")
                .startDate(LocalDate.now())
                .expirationDate(LocalDate.now().plusDays(20))
                .citizenGroups(Collections.emptySet())
                .build();
        benefit2.setId(UUID.randomUUID());
        List<Benefit> benefitList = List.of(benefit1, benefit2);
        Page<Benefit> benefitPage = new PageImpl<>(benefitList);

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(benefitRepository.findAllByTenantId(tenantId, pageable)).thenReturn(benefitPage);
        // When
        List<?> result = benefitService.getAllBenefitsForTenant(page, size);

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(2, result.size());
    }

    @Test
    void shouldReturnPagedBenefitsWithTotalBeneficiaries_WhenGetAllBenefitsForTenant() {
        // Given
        int page = 0;
        int size = 2;
        Pageable pageable = PageRequest.of(page, size, Sort.by(BenefitService.ORDER_CRITERIA).descending());

        CitizenGroup group1 = citizenGroupBuilder();
        CitizenGroup group2 = citizenGroupBuilder();

        Benefit benefit1 = Benefit.builder()
                .name("Benefit 1")
                .description("Description 1")
                .startDate(LocalDate.now())
                .expirationDate(LocalDate.now().plusDays(10))
                .citizenGroups(Set.of(group1, group2))
                .build();
        benefit1.setId(UUID.randomUUID());

        Benefit benefit2 = Benefit.builder()
                .name("Benefit 2")
                .description("Description 2")
                .startDate(LocalDate.now())
                .expirationDate(LocalDate.now().plusDays(20))
                .citizenGroups(Set.of(group1))
                .build();
        benefit2.setId(UUID.randomUUID());

        List<Benefit> benefitList = List.of(benefit1, benefit2);
        Page<Benefit> benefitPage = new PageImpl<>(benefitList);

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(benefitRepository.findAllByTenantId(tenantId, pageable)).thenReturn(benefitPage);
        when(passholderRepository.countByCitizenGroupId(group1.getId())).thenReturn(3);
        when(passholderRepository.countByCitizenGroupId(group2.getId())).thenReturn(2);

        // When
        List<?> result = benefitService.getAllBenefitsForTenant(page, size);

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(2, result.size());

        BenefitTableDto dto1 = (BenefitTableDto) result.get(0);
        BenefitTableDto dto2 = (BenefitTableDto) result.get(1);

        Assertions.assertEquals(5, dto1.getTotalBeneficiaries());
        Assertions.assertEquals(3, dto2.getTotalBeneficiaries());
    }

    @Test
    void shouldReturnCount_WhenCountAllByTenantId() {
        // Given
        int expectedCount = 5;
        when(principalService.getTenantId()).thenReturn(tenantId);
        when(benefitRepository.countAllByTenantId(tenantId)).thenReturn(Integer.valueOf(expectedCount));

        // When
        long count = benefitService.countAllByTenantId();

        // Then
        Assertions.assertEquals(expectedCount, count);
    }

    @Test
    void shouldReturnAllBenefitsForCitizen_WhenRepositoryReturnsList() throws DtoValidateNotFoundException {
        // Given
        User mockUser = new User();
        mockUser.setId(userId);

        BenefitResponseDto dto1 = new BenefitResponseDto(
                UUID.randomUUID(),
                "Free Bus Pass",
                "Unlimited rides for a month",
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                100.0,
                BenefitStatusEnum.ACTIVE,
                null,
                null,
                null
        );

        BenefitResponseDto dto2 = new BenefitResponseDto(
                UUID.randomUUID(),
                "Discount Voucher",
                "10% off local grocery stores",
                LocalDate.now(),
                LocalDate.now().plusDays(15),
                120.00,
                BenefitStatusEnum.EXPIRED,
                null,
                null,
                null
        );

        List<BenefitResponseDto> expectedBenefits = List.of(dto1, dto2);

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(mockUser);
        when(benefitRepository.findAllBenefitsForUserBenefits(tenantId, userId))
                .thenReturn(expectedBenefits);

        // When
        Map<String, List<BenefitResponseDto>> result = benefitService.getAllBenefitsForCitizen();

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(2, result.size());
        List<String> names = result.values().stream()
                .flatMap(List::stream)
                .map(BenefitResponseDto::name)
                .toList();
        Assertions.assertTrue(names.contains("Free Bus Pass"));
        Assertions.assertTrue(names.contains("Discount Voucher"));

        verify(benefitRepository).findAllBenefitsForUserBenefits(tenantId, userId);
    }

    @Test
    void getAllBenefitsForCitizen_ShouldComputeSpentAndRemaining() throws DtoValidateNotFoundException {
        UUID benefitId = UUID.randomUUID();

        BenefitResponseDto dto = new BenefitResponseDto(
                benefitId,
                "Test Benefit",
                "Description",
                LocalDate.now(),
                LocalDate.now().plusDays(10),
                200.0,
                BenefitStatusEnum.ACTIVE,
                null,
                null,
                null
        );
        Benefit benefit = Benefit.builder().build();
        benefit.setId(benefitId);
        CitizenBenefit citizenBenefit = CitizenBenefit.builder().amount(150.00).benefit(benefit).build();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(principalService.getUser()).thenReturn(new User() {{
            setId(userId);
        }});
        when(benefitRepository.findAllBenefitsForUserBenefits(tenantId, userId))
                .thenReturn(List.of(dto));
        when(citizenBenefitService.getCitizenBenefitsByUserId(userId)).thenReturn(List.of(citizenBenefit));

        Map<String, List<BenefitResponseDto>> result = benefitService.getAllBenefitsForCitizen();

        BenefitResponseDto enriched = result.get("active").get(0);
        Assertions.assertEquals(150.0, enriched.remainingAmount());
        Assertions.assertEquals(25.0, enriched.spentPercentage());
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
                .tenantId(tenantId)
                .build();
        citizenGroup.setId(UUID.randomUUID());
        return citizenGroup;
    }
}