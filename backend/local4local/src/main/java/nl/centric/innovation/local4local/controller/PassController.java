package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.PassDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.FilesUploadException;
import nl.centric.innovation.local4local.service.impl.PassService;
import nl.centric.innovation.local4local.util.annotation.ValidMultipartFile;
import nl.centric.innovation.local4local.util.annotation.ValidMultipartFileList;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/passes")
@Validated
public class PassController {

    private final PassService passService;

    @PostMapping
    @Secured({Role.ROLE_CITIZEN})
    @Operation(
            summary = "Create a new citizen pass",
            description = "Allows a Citizen to create a new pass. " +
                    "The request requires valid authentication and the role `ROLE_CITIZEN`.\n" +
                    "Error codes:\n" +
                    "40049 - Some documents exceed 10MB\n" +
                    "40050 - Document type not accepted\n" +
                    "40051 - Too many documents uploaded\n" +
                    "40052 - Documents failed to upload\n" +
                    "40053 - Duplicate document name"
    )
    public ResponseEntity<Void> save(@RequestPart("passDto")
                                     @Valid PassDto pass,
                                     @RequestParam("files")
                                     @Valid @ValidMultipartFileList List<@ValidMultipartFile MultipartFile> files,
                                     @CookieValue(value = "language_citizen", defaultValue = "nl-NL") String language
    ) throws DtoValidateException, FilesUploadException {
        passService.save(pass, files);
        passService.sendSummaryEmailAfterApplyForPass(language, pass.contactEmail());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<String> handleConstraintViolation(ConstraintViolationException ex) {
        String codes = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)        // only take the message (e.g. "40048")
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(codes);
    }
}
