package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.BenefitRequestDto;
import nl.centric.innovation.local4local.dto.BenefitResponseDto;
import nl.centric.innovation.local4local.dto.BenefitSpentDto;
import nl.centric.innovation.local4local.dto.BenefitTableDto;
import nl.centric.innovation.local4local.dto.EligibleBenefitDto;
import nl.centric.innovation.local4local.entity.CitizenBenefit;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.CitizenGroupAssignment;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.enums.BenefitStatusEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.BenefitRepository;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.repository.GroupCitizenAssignmentRepository;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.entity.Benefit.fromBenefitRequestDtoToEntity;


@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class BenefitService {
    public static final String ORDER_CRITERIA = "createdDate";

    private final CitizenGroupService citizenGroupService;

    private final GroupCitizenAssignmentRepository groupCitizenAssignmentRepository;

    private final PassholderRepository passholderRepository;

    private final BenefitRepository benefitRepository;

    private final PrincipalService principalService;

    private final CitizenBenefitService citizenBenefitService;

    @Value("${error.general.availability}")
    private String errorGeneralAvailability;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${error.citizenGroup.notFound}")
    private String errorCitizenGroupNotFound;

    public Optional<Benefit> findById(UUID benefitId) throws DtoValidateException {
        return benefitRepository.findById(benefitId);
    }

    public BenefitResponseDto createBenefit(BenefitRequestDto benefitRequestDto) throws DtoValidateException {
        validateBenefitRequest(benefitRequestDto);

        Set<CitizenGroup> citizenGroups = citizenGroupService.getAllByIdsAndTenantId(benefitRequestDto.citizenGroupIds(), getTenantId());
        if (citizenGroups.size() != benefitRequestDto.citizenGroupIds().size()) {
            throw new DtoValidateNotFoundException(errorEntityValidate);
        }

        Benefit benefitToSave = fromBenefitRequestDtoToEntity(benefitRequestDto, getTenantId(), citizenGroups);

        Benefit createdBenefit = benefitRepository.save(benefitToSave);
        List<Passholder> passholdersWithUserForBenefit = passholderRepository.findAllByUserNotNullAndCitizenGroupIn(citizenGroups);
        List<UUID> userToCreateBenefitFor = passholdersWithUserForBenefit.stream()
                .map(passholder -> passholder.getUser().getId())
                .toList();
        citizenBenefitService.createCitizenBenefitForBenefitAndUserIds(createdBenefit, userToCreateBenefitFor);
        return BenefitResponseDto.entityToBenefitResponseDto(createdBenefit);
    }

    @Transactional
    public List<BenefitTableDto> getAllBenefitsForTenant(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA).descending());
        Page<Benefit> benefits = benefitRepository.findAllByTenantId(getTenantId(), pageable);

        return benefits.stream().map(this::toBenefitTableDto).collect(Collectors.toList());
    }

    public long countAllByTenantId() {
        return benefitRepository.countAllByTenantId(getTenantId());
    }

    @Transactional
    public List<EligibleBenefitDto> getAllBenefitsDtoForCitizenGroup() throws DtoValidateNotFoundException {
        Set<Benefit> benefits = getAllBenefitsForCitizenGroup();
        return benefits.stream()
                .map(EligibleBenefitDto::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Set<Benefit> getAllBenefitsForCitizenGroup() throws DtoValidateNotFoundException {
        Optional<CitizenGroupAssignment> citizenGroupAssignment = groupCitizenAssignmentRepository.findByCitizenId(getUserId());

        if (citizenGroupAssignment.isEmpty()) {
            throw new DtoValidateNotFoundException(errorCitizenGroupNotFound);
        }

        return citizenGroupAssignment.get().getCitizenGroup().getBenefits();
    }

    @Transactional
    public List<BenefitTableDto> getAllBenefitsForTenant() {
        List<Benefit> benefits = benefitRepository.findAllByTenantIdAndStatus(principalService.getTenantId(), BenefitStatusEnum.ACTIVE);
        return benefits.stream().map(this::toBenefitTableDto).collect(Collectors.toList());
    }

    public Map<String, List<BenefitResponseDto>> getAllBenefitsForCitizen() throws DtoValidateNotFoundException {
        UUID userId = getUserId();
        List<BenefitResponseDto> benefits = fetchBenefitsForCitizen(getTenantId(), userId);
        List<BenefitResponseDto> enriched = enrichBenefitsWithSpent(benefits, userId);
        return groupBenefitsByStatus(enriched);
    }

    private List<BenefitResponseDto> fetchBenefitsForCitizen(UUID tenantId, UUID userId) {
        return benefitRepository.findAllBenefitsForUserBenefits(tenantId, userId);
    }

    private List<BenefitResponseDto> enrichBenefitsWithSpent(List<BenefitResponseDto> benefits, UUID userId) throws DtoValidateNotFoundException {
        if (benefits.isEmpty()) return List.of();

        List<CitizenBenefit> citizenBenefits =
                citizenBenefitService.getCitizenBenefitsByUserId(userId);

        Map<UUID, CitizenBenefit> citizenBenefitMap = citizenBenefits.stream()
                .collect(Collectors.toMap(
                        cb -> cb.getBenefit().getId(),
                        cb -> cb
                ));

        return benefits.stream()
                .map(b -> {
                    CitizenBenefit cb = citizenBenefitMap.get(b.id());
                    Double remainingAmount = cb != null ? cb.getAmount() : b.amount();
                    return b.withRemainingAmount(remainingAmount);
                })
                .toList();
    }

    private Map<String, List<BenefitResponseDto>> groupBenefitsByStatus(List<BenefitResponseDto> benefits) {
        return benefits.stream()
                .collect(Collectors.groupingBy(
                        b -> b.status() == BenefitStatusEnum.ACTIVE ? "active" : "expired"
                ));
    }

    private void validateBenefitRequest(BenefitRequestDto benefitRequestDto) throws DtoValidateException {
        if (!benefitRequestDto.startDate().isBefore(benefitRequestDto.expirationDate())) {
            throw new DtoValidateException(errorGeneralAvailability);
        }
    }

    private UUID getTenantId() {
        return principalService.getTenantId();
    }

    private UUID getUserId() {
        return principalService.getUser().getId();
    }

    private BenefitTableDto toBenefitTableDto(Benefit benefit) {
        BenefitTableDto dto = BenefitTableDto.entityToBenefitTableDto(benefit);
        int totalCitizens = benefit.getCitizenGroups().stream()
                .mapToInt(group -> passholderRepository.countByCitizenGroupId(group.getId()))
                .sum();
        dto.setTotalBeneficiaries(totalCitizens);
        return dto;
    }


}
