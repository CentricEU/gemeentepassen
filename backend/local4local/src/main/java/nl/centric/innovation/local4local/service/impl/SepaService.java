package nl.centric.innovation.local4local.service.impl;

import com.prowidesoftware.swift.model.mx.MxPain00100103;
import com.prowidesoftware.swift.model.mx.dic.AccountIdentification4Choice;
import com.prowidesoftware.swift.model.mx.dic.ActiveOrHistoricCurrencyAndAmount;
import com.prowidesoftware.swift.model.mx.dic.AmountType3Choice;
import com.prowidesoftware.swift.model.mx.dic.BranchAndFinancialInstitutionIdentification4;
import com.prowidesoftware.swift.model.mx.dic.CashAccount16;
import com.prowidesoftware.swift.model.mx.dic.CreditTransferTransactionInformation10;
import com.prowidesoftware.swift.model.mx.dic.CustomerCreditTransferInitiationV03;
import com.prowidesoftware.swift.model.mx.dic.FinancialInstitutionIdentification7;
import com.prowidesoftware.swift.model.mx.dic.GroupHeader32;
import com.prowidesoftware.swift.model.mx.dic.PartyIdentification32;
import com.prowidesoftware.swift.model.mx.dic.PaymentIdentification1;
import com.prowidesoftware.swift.model.mx.dic.PaymentInstructionInformation3;
import com.prowidesoftware.swift.model.mx.dic.PaymentMethod3Code;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceTenantDto;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static nl.centric.innovation.local4local.util.DateUtils.getLastDayOfMonth;

@Service
@Slf4j
@RequiredArgsConstructor
public class SepaService {
    private final OfferTransactionService offerTransactionService;
    private final PrincipalService principalService;
    private final SupplierService supplierService;
    private final TenantRepository tenantRepository;
    private static final String CURRENCY = "EUR";
    private static final Integer DAYS_UNTIL_DUE_DATE = 30;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    /**
     * Generates a SEPA XML payment file as a string.
     * It builds the group header and payment information sections,
     * wraps them in a CustomerCreditTransferInitiationV03 message,
     * and returns the serialized XML representation.
     *
     * @return the SEPA payment XML file content as a string
     */
    public String generateSepaFile(LocalDate month) throws DtoValidateNotFoundException {
        List<OfferTransactionInvoiceTenantDto> transactions = getOfferTransactionsByTenant(month);

        if (transactions.isEmpty()) {
            log.warn("No transactions found for the current month.");
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        CustomerCreditTransferInitiationV03 creditTransfer = new CustomerCreditTransferInitiationV03();

        creditTransfer.setGrpHdr(buildGroupHeader(transactions));
        creditTransfer.getPmtInf().add(buildPaymentInfo(transactions));

        MxPain00100103 message = new MxPain00100103();
        message.setCstmrCdtTrfInitn(creditTransfer);
        return message.message();
    }

    /**
     * Constructs and returns a GroupHeader32 object containing
     * the message identification, creation timestamp, number of transactions,
     * control sum (total amount), and initiating party information.
     *
     * @return a fully populated GroupHeader32 instance for message header
     */
    private GroupHeader32 buildGroupHeader(List<OfferTransactionInvoiceTenantDto> transactions) {
        GroupHeader32 header = new GroupHeader32();
        header.setMsgId(generateMessageIdentification());
        header.setCreDtTm(OffsetDateTime.now());

        BigDecimal totalAmount = calculateTotalAmount(transactions);

        header.setNbOfTxs(String.valueOf(transactions.size()));
        header.setCtrlSum(totalAmount);

        PartyIdentification32 initiatingParty = new PartyIdentification32();
        initiatingParty.setNm(getDebtorName());
        header.setInitgPty(initiatingParty);

        return header;
    }


    /**
     * Builds and returns a PaymentInstructionInformation3 object
     * with payment details including debtor info, account, agent,
     * payment method, and requested execution date set to 30 days from today.
     *
     * @return a populated PaymentInstructionInformation3 instance ready for processing
     */
    private PaymentInstructionInformation3 buildPaymentInfo(List<OfferTransactionInvoiceTenantDto> transactions) throws DtoValidateNotFoundException {
        PaymentInstructionInformation3 paymentInfo = new PaymentInstructionInformation3();
        paymentInfo.setPmtInfId(generatePaymentInformationIdentification());
        paymentInfo.setPmtMtd(PaymentMethod3Code.TRF);
        paymentInfo.setReqdExctnDt(LocalDate.now().plusDays(DAYS_UNTIL_DUE_DATE));

        paymentInfo.setDbtr(buildParty(getDebtorName()));

        Tenant tenant = geTenant();
        paymentInfo.setDbtrAcct(buildAccount(tenant.getIban()));
        paymentInfo.setDbtrAgt(buildAgent(tenant.getBic()));

        // Add each transaction's credit transfer info
        for (OfferTransactionInvoiceTenantDto tx : transactions) {
            paymentInfo.getCdtTrfTxInf().add(buildCreditTransferTransaction(tx));
        }
        return paymentInfo;
    }

    /**
     * Builds and returns a CreditTransferTransactionInformation10 object
     * representing a single credit transfer transaction with payment identification,
     * instructed amount (currency and value), creditor details, and creditor account.
     *
     * @return a fully populated CreditTransferTransactionInformation10 instance
     */
    private CreditTransferTransactionInformation10 buildCreditTransferTransaction(OfferTransactionInvoiceTenantDto transactionDto) throws DtoValidateNotFoundException {
        CreditTransferTransactionInformation10 transaction = new CreditTransferTransactionInformation10();

        PaymentIdentification1 pmtId = new PaymentIdentification1();
        pmtId.setEndToEndId(generateEndtoEndIdentification()); //checked
        transaction.setPmtId(pmtId);

        AmountType3Choice amt = new AmountType3Choice();
        ActiveOrHistoricCurrencyAndAmount instructedAmount = new ActiveOrHistoricCurrencyAndAmount();
        instructedAmount.setCcy(CURRENCY);
        instructedAmount.setValue(BigDecimal.valueOf(transactionDto.amount()));
        amt.setInstdAmt(instructedAmount);
        transaction.setAmt(amt);

        transaction.setCdtr(buildParty(transactionDto.supplierName()));
        transaction.setCdtrAcct(buildAccount(transactionDto.supplierIban()));

        return transaction;
    }

    /**
     * Creates and returns a PartyIdentification32 object with the given party name set.
     *
     * @param name the name of the party
     * @return a PartyIdentification32 instance with the name initialized
     */
    private PartyIdentification32 buildParty(String name) {
        PartyIdentification32 party = new PartyIdentification32();
        party.setNm(name);
        return party;
    }

    /**
     * Creates and returns a CashAccount16 object with the specified IBAN set as the account identifier.
     *
     * @param iban the IBAN string for the account
     * @return a CashAccount16 instance with the IBAN initialized
     */
    private CashAccount16 buildAccount(String iban) {
        CashAccount16 account = new CashAccount16();
        AccountIdentification4Choice id = new AccountIdentification4Choice();
        id.setIBAN(iban);
        account.setId(id);
        return account;
    }

    /**
     * Creates and returns a BranchAndFinancialInstitutionIdentification4 object
     * representing the financial institution agent identified by the given BIC.
     *
     * @param bic the BIC (Bank Identifier Code) of the financial institution
     * @return a BranchAndFinancialInstitutionIdentification4 instance with the BIC set
     */
    private BranchAndFinancialInstitutionIdentification4 buildAgent(String bic) {
        FinancialInstitutionIdentification7 financialIdentification = new FinancialInstitutionIdentification7();
        financialIdentification.setBIC(bic);

        BranchAndFinancialInstitutionIdentification4 agent = new BranchAndFinancialInstitutionIdentification4();
        agent.setFinInstnId(financialIdentification);
        return agent;
    }

    private List<OfferTransactionInvoiceTenantDto> getOfferTransactionsByTenant(LocalDate firstDayOfMonth) {
        return offerTransactionService.getTransactionsByMonthYearAndTenantId(
                firstDayOfMonth, getLastDayOfMonth(firstDayOfMonth));
    }

    private BigDecimal calculateTotalAmount(List<OfferTransactionInvoiceTenantDto> transactions) {
        return transactions.stream()
                .map(tx -> BigDecimal.valueOf(tx.amount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_EVEN);
    }

    // The following three methods are now generated as placeholders until it is decided how to implement them.
    private String generateMessageIdentification() {
        return "MSG-" + UUID.randomUUID().toString().replace("-", "").substring(0, 30);
    }

    private String generatePaymentInformationIdentification() {
        return "PMT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 30);
    }

    private String generateEndtoEndIdentification() {
        return "E2E-" + UUID.randomUUID().toString().replace("-", "").substring(0, 30);
    }

    private String getCreditorName() {
        return principalService.getUserFullName();
    }

    private String getDebtorName() {
        return principalService.getTenant().getName();
    }

    private Tenant geTenant() throws DtoValidateNotFoundException {
        UUID tenantId = principalService.getTenantId();
        Optional<Tenant> tenant = tenantRepository.findById(tenantId);

        if(tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return tenant.get();
    }
}
