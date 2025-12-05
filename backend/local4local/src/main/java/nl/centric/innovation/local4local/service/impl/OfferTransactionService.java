package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto;
import nl.centric.innovation.local4local.dto.OfferTransactionTableDto;
import nl.centric.innovation.local4local.dto.TransactionDetailsDto;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.OfferTransaction;
import nl.centric.innovation.local4local.repository.OfferTransactionRepository;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static nl.centric.innovation.local4local.util.Constants.ZERO_AMOUNT;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class OfferTransactionService {

    private final OfferTransactionRepository offerTransactionRepository;

    private final PrincipalService principalService;

    public void saveTransaction(DiscountCode code, Double amount, LocalDateTime currentTime) {
        OfferTransaction offerTransactionToSave = OfferTransaction.offerTransactionDtoToEntity(code, currentTime);
        offerTransactionToSave.setAmount(amount != ZERO_AMOUNT ? amount : code.getOffer().getAmount());

        offerTransactionRepository.save(offerTransactionToSave);
    }

    public Optional<OfferTransaction> getLastOfferValidationForCitizen(UUID offerId, UUID citizenId) {
        return offerTransactionRepository.findFirstByDiscountCode_UserIdAndDiscountCode_OfferIdOrderByCreatedDateDesc(citizenId, offerId);
    }

    public List<TransactionDetailsDto> getAllValidTransactions() {

        return offerTransactionRepository.findAllByDiscountCode_Offer_SupplierIdOrderByCreatedDateDesc(getSupplierId())
                .stream()
                .map(this::convertToTransactionDetailsDto)
                .collect(Collectors.toList());
    }

    public List<Integer> getDistinctYearsForTransactionsBySupplierId() {
        return offerTransactionRepository.findDistinctYearByCreatedDateDesc(getSupplierId());
    }

    public Integer countMonthYearTransactionsBySupplierId(Integer month, Integer year) {
        return offerTransactionRepository.countMonthYearTransactionsBySupplierId(getSupplierId(), month, year);
    }

    public Integer countAllTransactionsBySupplierId() {
        return offerTransactionRepository.countByDiscountCodeOfferSupplierId(getSupplierId());
    }

    public List<OfferTransactionTableDto> getTransactionsByMonthAndYear(Integer month, Integer year, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        return offerTransactionRepository.findTransactionsByMonthAndYear(
                getSupplierId(), month, year, pageable);
    }

    public List<OfferTransactionInvoiceDto> getTransactionsByMonthAndYear(LocalDate startDate, LocalDate endDate) {
        LocalDateTime endOfDay = endDate.atStartOfDay().plusDays(1).minusNanos(1);
        return offerTransactionRepository.findTransactionsByMonthAndYear(
                getSupplierId(), startDate.atStartOfDay(), endOfDay);
    }

    private TransactionDetailsDto convertToTransactionDetailsDto(OfferTransaction transaction) {
        return TransactionDetailsDto.of(
                transaction.getDiscountCode().getCode(),
                transaction.getCreatedDate()
        );
    }

    private UUID getSupplierId() {
        return principalService.getSupplierId();
    }

}
