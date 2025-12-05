package nl.centric.innovation.local4local.service.impl;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.InvoiceDto;
import nl.centric.innovation.local4local.dto.OfferTransactionInvoiceDto;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.InvoiceGenerationException;
import nl.centric.innovation.local4local.service.interfaces.SupplierService;
import nl.centric.innovation.local4local.util.DateUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.ITemplateEngine;

import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import static nl.centric.innovation.local4local.util.DateUtils.formatDateDefault;
import static nl.centric.innovation.local4local.util.DateUtils.getLastDayOfMonth;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private static final int FIRST_DAY_OF_MONTH = 1;

    private final OfferTransactionService offerTransactionService;
    private final SupplierService supplierService;
    private final PrincipalService principalService;
    private final ITemplateEngine templateEngine;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    /**
     * Generates a PDF invoice based on the provided invoice data and language.
     *
     * @throws InvoiceGenerationException if an error occurs during PDF generation, e.g. not closing the stream
     */
    public byte[] generateInvoice(InvoiceDto invoiceDto, String language) {
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             PdfWriter writer = new PdfWriter(byteArrayOutputStream)) {
            String htmlContent = generateHtmlContent(invoiceDto, language);
            HtmlConverter.convertToPdf(htmlContent, writer);
            return byteArrayOutputStream.toByteArray();
        } catch (Exception e) {
            throw new InvoiceGenerationException("Error generating invoice PDF", e);
        }
    }

    private String generateHtmlContent(InvoiceDto invoiceDto, String language) throws DtoValidateNotFoundException {
        LocalDate invoiceDate = invoiceDto.currentDate();

        List<OfferTransactionInvoiceDto> offerTransactions = getOfferTransactions(invoiceDate);

        if (offerTransactions.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        Tenant tenant = principalService.getTenant();

        Context context = new Context(Locale.forLanguageTag(language));

        context.setVariable("invoiceNumber", invoiceDto.invoiceNumber());
        context.setVariable("invoiceDate", invoiceDate.toString());
        context.setVariable("supplierName", principalService.getUserFullName());
        context.setVariable("municipalityName", tenant.getName());
        context.setVariable("municipalityAddress", tenant.getAddress());
        context.setVariable("supplierAddress", getSupplierAddress());
        context.setVariable("billingPeriod", formatBillingPeriod(invoiceDate));
        context.setVariable("issueDate", DateUtils.formatDateDefault(invoiceDto.issueDate()));
        context.setVariable("dueDate", DateUtils.formatDateDefault(invoiceDto.getFinalDueDate()));
        context.setVariable("totalAmount", calculateTotalAmount(offerTransactions));
        context.setVariable("offerTransactions", offerTransactions);

        return templateEngine.process("invoiceTemplate", context);
    }

    private String getSupplierAddress() {
        SupplierProfile profile = supplierService.findBySupplierId(principalService.getSupplierId()).get().getProfile();

        return String.format("%s, %s, %s, %s",
                profile.getBranchLocation(),
                profile.getBranchProvince(),
                profile.getBranchZip(),
                profile.getBranchLocation());
    }

    private List<OfferTransactionInvoiceDto> getOfferTransactions(LocalDate firstDayOfMonth) {
        return offerTransactionService.getTransactionsByMonthAndYear(
                firstDayOfMonth, getLastDayOfMonth(firstDayOfMonth));
    }

    private String calculateTotalAmount(List<OfferTransactionInvoiceDto> offerTransactions) {
        double amount = offerTransactions.stream()
                .mapToDouble(OfferTransactionInvoiceDto::amount)
                .sum();

        return String.format(Locale.GERMANY, "%,.2f", amount);
    }

    private String formatBillingPeriod(LocalDate date) {
        String start = formatDateDefault(date.withDayOfMonth(FIRST_DAY_OF_MONTH));
        String end = formatDateDefault(date.withDayOfMonth(date.lengthOfMonth()));

        return String.format("%s - %s", start, end);
    }

}
