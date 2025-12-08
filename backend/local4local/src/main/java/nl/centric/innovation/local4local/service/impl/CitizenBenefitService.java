package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.Benefit;
import nl.centric.innovation.local4local.entity.CitizenBenefit;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.CitizenBenefitRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CitizenBenefitService {

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    private final CitizenBenefitRepository citizenBenefitRepository;

    public void createCitizenBenefitForUserIdAndBenefits(UUID userId, Set<Benefit> benefits) {
        List<CitizenBenefit> citizenBenefits = benefits.stream()
                .map(benefit -> CitizenBenefit.builder()
                        .amount(benefit.getAmount())
                        .benefit(benefit)
                        .userId(userId)
                        .build()
                ).toList();

        citizenBenefitRepository.saveAll(citizenBenefits);
    }


    public void createCitizenBenefitForBenefitAndUser(Benefit benefit, UUID userId) {
        CitizenBenefit citizenBenefit = CitizenBenefit.builder().amount(benefit.getAmount())
                .benefit(benefit)
                .userId(userId)
                .build();
        citizenBenefitRepository.save(citizenBenefit);
    }

    public void createCitizenBenefitForBenefitAndUserIds(Benefit benefit, List<UUID> userIds) {

        List<CitizenBenefit> citizenBenefits = userIds.stream()
                .map(userId -> CitizenBenefit.builder().amount(benefit.getAmount())
                        .benefit(benefit)
                        .userId(userId)
                        .build()
                ).toList();
        citizenBenefitRepository.saveAll(citizenBenefits);
    }

    public CitizenBenefit getCitizenBenefitByUserIdAndBenefit(UUID userId, UUID benefitId) throws DtoValidateNotFoundException {
        return citizenBenefitRepository.findByUserIdAndBenefitId(userId, benefitId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
    }

    public List<CitizenBenefit> getCitizenBenefitsByUserId(UUID userId) {
        return citizenBenefitRepository.findByUserId(userId);
    }

    public void saveCitizenBenefit(CitizenBenefit citizenBenefit) {
        this.citizenBenefitRepository.save(citizenBenefit);
    }

    @Transactional
    public void updateAmount(UUID userId, UUID benefitId, Double usedAmount) throws DtoValidateNotFoundException {
        CitizenBenefit benefitToUpdate = getCitizenBenefitByUserIdAndBenefit(userId, benefitId);
        benefitToUpdate.setAmount(benefitToUpdate.getAmount() - usedAmount);
    }
}
