package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CodeValidationResponseDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
import nl.centric.innovation.local4local.dto.CodeValidationRequestDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.DiscountCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@RestController
@Validated
@RequestMapping("/discount-codes")
@RequiredArgsConstructor
public class DiscountCodeController {

    private final DiscountCodeService discountCodeService;

    @GetMapping
    @Secured({Role.ROLE_CITIZEN})
    @Operation(
            summary = "Get all discount codes",
            description = "Returns all discount codes available in the system.",
            responses = {
                    @ApiResponse(responseCode = "200",
                            description = "Returns a list of discount codes ordered by status and creation date.")
            }

    )
    public ResponseEntity<Map<String, List<DiscountCodeViewDto>>> getDiscountCodes() {
        return ResponseEntity.ok(discountCodeService.getDiscountCodes());
    }

    @GetMapping("/{offerId}")
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<DiscountCodeViewDto> getDiscountCode(@PathVariable("offerId") UUID offerId)
            throws DtoValidateNotFoundException {
        return ResponseEntity.ok(discountCodeService.getDiscountCode(offerId));
    }

    @PostMapping("/validate")
    @Secured(Role.ROLE_SUPPLIER)
    public ResponseEntity<CodeValidationResponseDto> validateDiscountCode(@Valid @RequestBody CodeValidationRequestDto codeValidationDto) throws DtoValidateException {
        CodeValidationResponseDto validationResponse = discountCodeService.validateAndProcessDiscountCode(codeValidationDto);
        return ResponseEntity.ok(validationResponse);
    }

}

