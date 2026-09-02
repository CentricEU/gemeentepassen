package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
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
    @Operation(
            summary = "Get discount code by offer ID",
            description = "Returns the discount code associated with the specified offer ID.",
            responses = {
                    @ApiResponse(responseCode = "200",
                            description = "Returns the discount code for the given offer ID."),
                    @ApiResponse(responseCode = "404",
                            description = "Discount code not found for the given offer ID.")
            }
    )
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<DiscountCodeViewDto> getDiscountCode(@PathVariable("offerId") UUID offerId)
            throws DtoValidateNotFoundException {
        return ResponseEntity.ok(discountCodeService.getDiscountCode(offerId));
    }

    @PostMapping("/validate")
    @Operation(
            summary = "Validate and process a discount code",
            description = "Validates the provided discount code and processes it if valid.",
            responses = {
                    @ApiResponse(responseCode = "200",
                            description = "Returns the result of the discount code validation and processing.")
            }
    )
    @Secured({Role.ROLE_SUPPLIER, Role.ROLE_CASHIER})
    public ResponseEntity<CodeValidationResponseDto> validateDiscountCode(@Valid @RequestBody CodeValidationRequestDto codeValidationDto) throws DtoValidateException {
        CodeValidationResponseDto validationResponse = discountCodeService.validateDiscountCodeAndProcessTransaction(codeValidationDto);
        return ResponseEntity.ok(validationResponse);
    }

    @GetMapping("/claimed/{offerId}")
    @Operation(
            summary = "Check if discount code is claimed for an offer (if that offer has discount codes)",
            description = "Returns true if a discount code has been claimed for the specified offer ID, false otherwise.",
            responses = {
                    @ApiResponse(responseCode = "200",
                            description = "Indicates whether a discount code has been claimed for the offer.")
            }
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Boolean> isDiscountCodeClaimedForOffer(@PathVariable("offerId") UUID offerId) throws DtoValidateNotFoundException {
        return ResponseEntity.ok(discountCodeService.isDiscountCodeClaimedForOffer(offerId));
    }

}

