package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.SepaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.time.LocalDate;


@RestController
@RequestMapping("sepa")
@RequiredArgsConstructor
public class SepaController {

    private final SepaService sepaService;

    @Operation(
            summary = "Generate SEPA XML file",
            description = "Generates a SEPA XML file for the given month and returns it as a downloadable attachment."
    )
    @PostMapping
    @Secured(Role.ROLE_MUNICIPALITY_ADMIN)
    public ResponseEntity<String> generateSepaFile(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @Parameter(description = "Month for which the SEPA file is generated") LocalDate month) throws DtoValidateNotFoundException {

        String xml = sepaService.generateSepaFile(month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sepa_" + LocalDate.now() + ".xml")
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }
}
