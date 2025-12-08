//[PDF Invoice] This controller class is no longer used, but kept for reference or future use
package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.InvoiceDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.impl.InvoiceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private static final String INVOICE_FILENAME = "invoice.pdf";

    private final InvoiceService invoiceService;

    @PostMapping
    @Secured({Role.ROLE_SUPPLIER})
    @Operation(
            summary = "Generate invoice",
            description = "Generate invoice for the given invoice details"
    )
    public ResponseEntity<byte[]> generateInvoice(
            @Valid @RequestBody InvoiceDto invoiceDto,
            @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language
    ) {
        byte[] pdfData = invoiceService.generateInvoice(invoiceDto, language);

        return ResponseEntity.ok()
                // This forces the browser to download the file instead of displaying it inline.
                .header("Content-Disposition", String.format("attachment; filename=\"invoice_%s.pdf\"",
                        invoiceDto.invoiceNumber()))
                // Without this property, the browser or client might not recognize it properly.
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);

    }
}
