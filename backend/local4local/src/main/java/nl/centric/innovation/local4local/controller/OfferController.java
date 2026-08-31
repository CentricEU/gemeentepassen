// Todo: refactor the controller to reduce its size because it has too many responsibilities.

package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.ApproveOfferDto;
import nl.centric.innovation.local4local.dto.DeleteOffersDto;
import nl.centric.innovation.local4local.dto.DiscountCodeViewDto;
import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferDownloadRequestDto;
import nl.centric.innovation.local4local.dto.OfferMobileDetailDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightView;
import nl.centric.innovation.local4local.dto.OfferRejectionReasonDto;
import nl.centric.innovation.local4local.dto.OfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferDto;
import nl.centric.innovation.local4local.dto.OfferStatusCountsDto;
import nl.centric.innovation.local4local.dto.OfferUsageRequestDto;
import nl.centric.innovation.local4local.dto.OfferViewDto;
import nl.centric.innovation.local4local.dto.OfferViewTableDto;
import nl.centric.innovation.local4local.dto.ReactivateOfferDto;
import nl.centric.innovation.local4local.dto.RejectOfferDto;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.OfferService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.interfaces.OfferTypeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferTypeService offerTypeService;

    private final OfferService offerService;

    private final PrincipalService principalService;

    private final SupplierService supplierService;

    // Todo: to be moved in service
    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @GetMapping("/types")
    @Operation(
            summary = "Get all offer types",
            description = "Retrieve a list of all available offer types that can be used when creating or filtering offers."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<List<OfferType>> getAllOfferTypes() {
        return ResponseEntity.ok(offerTypeService.getAllOfferTypes());
    }

    @PostMapping()
    @Operation(
            summary = "Create a new offer",
            description = "Create a new offer with the provided details, which will be subject to review and approval by the municipality before becoming active."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<List<OfferViewDto>> createOffer(@Valid @RequestBody OfferRequestDto offerRequestDto,
                                                          @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language) throws DtoValidateException {

        List<OfferViewDto> result = offerService.createOffer(offerRequestDto, language);

        return ResponseEntity.ok(result);
    }

    @PostMapping(path = "/use")
    @Operation(
            summary = "Use an offer",
            description = "Mark a specific offer as used by a passholder, which may involve validating the discount code and updating the offer's usage status accordingly."
    )
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<Void> useOffer(@Valid @RequestBody OfferUsageRequestDto offerUsageRequestDto) throws DtoValidateException {
        offerService.useOffer(offerUsageRequestDto);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping(path = "/download")
    @Operation(
            summary = "Download offer as PDF",
            description = "Download the details of a specific offer as a PDF document, which includes the discount code and offer information."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<byte[]> downloadCode(@Valid @RequestBody OfferDownloadRequestDto offerDownloadRequestDto,
                                                            @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language) throws DtoValidateException {
        DiscountCodeViewDto discountCodeViewDto = offerService.downloadDiscountCode(offerDownloadRequestDto);

        byte[] pdfData = offerService.generateOfferPDF(discountCodeViewDto, language);

        return ResponseEntity.ok()
                // This forces the browser to download the file instead of displaying it inline.
                .header("Content-Disposition", String.format("attachment; filename=\"offer_%s.pdf\"",
                        offerDownloadRequestDto.offerId()))
                // Without this property, the browser or client might not recognize it properly.
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }

    @PatchMapping("/edit/{offerId}")
    @Operation(
            summary = "Edit an offer",
            description = "Edit the details of an existing offer. Only offers that are in a pending or rejected state can be edited."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferViewDto> editOffer(
            @PathVariable UUID offerId,
            @Valid @RequestBody OfferRequestDto dto,
            @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language
    ) throws DtoValidateException {
        OfferViewDto updatedOffer = offerService.editOffer(offerId, dto, language);
        return ResponseEntity.ok(updatedOffer);
    }

    @PutMapping("/approve")
    @Operation(
            summary = "Approve an offer",
            description = "Approve a pending offer, making it active and available to users."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Void> approveOffer(@Valid @RequestBody ApproveOfferDto dto,
                                             @CookieValue(value = "language_municipality", defaultValue = "nl-NL") String language) throws DtoValidateException {

        offerService.approveOffer(dto, language);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/suspend/{offerId}")
    @Operation(
            summary = "Suspend an offer",
            description = "Suspend an active offer, making it temporarily unavailable to users."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Void> suspendOffer(@PathVariable("offerId") UUID offerId) throws DtoValidateException {
        offerService.suspendOffer(offerId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    @Operation(
            summary = "Get paginated offers for supplier",
            description = "Retrieve a paginated list of offers associated with the authenticated supplier."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<List<OfferViewTableDto>> getAllForSupplierPaginated(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size) {
        List<OfferViewTableDto> response = offerService.getAll(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(
            summary = "Get paginated offers for specific supplier",
            description = "Retrieve a paginated list of offers associated with the specified supplier ID."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<List<OfferViewTableDto>> getAllBySupplierIdPaginated(
            @PathVariable("supplierId") UUID supplierId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size) throws DtoValidateNotFoundException {
        // to be moved in service
        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierId);

        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        List<OfferViewTableDto> response = offerService.getAllBySupplierIdPaginated(page, size, supplierId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @Operation(
            summary = "Count offers for authenticated supplier",
            description = "Get the total count of offers associated with the authenticated supplier."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Integer> countAllBySupplierId() {
        return ResponseEntity.ok(offerService.countAll());
    }

    @GetMapping("/tenant")
    @Operation(
            summary = "Get paginated offers for tenant",
            description = "Retrieve a paginated list of offers associated with the tenant of the authenticated user."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<List<OfferViewTableDto>> getAllByTenantId(@RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(defaultValue = "25") Integer size) {
        List<OfferViewTableDto> response = offerService.getAllForTenantPaginated(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/passholder/{passholderId}")
    @Operation(
            summary = "Get offers for passholder",
            description = "Retrieve a list of offers associated with the specified passholder ID."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<List<OfferViewTableDto>> getAllForPassholder(@PathVariable("passholderId") UUID passholderId) throws DtoValidateException {
        List<OfferViewTableDto> response = offerService.getAllForPassholder(passholderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supplier/{supplierId}/count")
    @Operation(
            summary = "Count offers for specific supplier",
            description = "Get the total count of offers associated with the specified supplier ID."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Integer> countAllBySupplierId(@PathVariable("supplierId") UUID supplierId) throws DtoValidateNotFoundException {
        // to be moved in service
        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierId);

        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return ResponseEntity.ok(offerService.countAllBySupplierId(supplierId));
    }

    @GetMapping("/tenant/count")
    @Operation(
            summary = "Count offers for tenant",
            description = "Get the total count of offers associated with the tenant of the authenticated user."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Integer> countAllByTenantId() {
        return ResponseEntity.ok(offerService.countAllForTenantId());
    }


    @GetMapping("/map-with-viewport")
    @Operation(summary = "Get offers within viewport",
            description = "Retrieve offers within the specified geographical viewport.")
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<Map<String, List<OfferMobileMapLightView>>> getOffersWithinViewport(
            @RequestParam @Parameter(description = "Minimum latitude of the viewport", required = true) Double minLatitude,
            @RequestParam @Parameter(description = "Maximum latitude of the viewport", required = true) Double maxLatitude,
            @RequestParam @Parameter(description = "Minimum longitude of the viewport", required = true) Double minLongitude,
            @RequestParam @Parameter(description = "Maximum longitude of the viewport", required = true) Double maxLongitude,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @Parameter(description = "Current day in ISO date format", required = true) LocalDate currentDay,
            @RequestParam @Parameter(description = "Offer type: -1 -> All, 1 -> Percentage, 2 -> BOGO, 3 -> Credit, 4 -> FreeEntry", required = true) Integer offerType,
            @RequestParam(required = false) @Size(min = 3, message = "Search keyword must have at least 3 characters")
            @Parameter(description = "Optional search keyword, if present must have at least 3 characters") String searchKeyword) {
        return ResponseEntity.ok(offerService.getOffersWithinViewport(minLatitude, maxLatitude, minLongitude, maxLongitude, currentDay, offerType, searchKeyword));
    }

    @GetMapping("/list")
    @Secured({Role.ROLE_CITIZEN})
    @Operation(summary = "Get offers ordered by distance",
            description = "Retrieve offers ordered by their proximity to the given location, with optional search filtering.")
    public ResponseEntity<?> getOffersOrderedByDistance(
            @RequestParam @Parameter(description = "Page number for pagination", required = true) Integer page,
            @RequestParam @Parameter(description = "Latitude of the user's location", required = true) Double latitude,
            @RequestParam @Parameter(description = "Longitude of the user's location", required = true) Double longitude,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @Parameter(description = "Current day in ISO date format", required = true) LocalDate currentDay,
            @RequestParam(required = false) @Size(min = 3, message = "Search keyword must have at least 3 characters")
            @Parameter(description = "Optional search keyword, if present must have at least 3 characters") String searchKeyword,
            @RequestParam @Parameter(description = "Offer type: -1 -> All, 1 -> Percentage, 2 -> BOGO, 3 -> Credit, 4 -> FreeEntry", required = true) Integer offerType

    ) throws DtoValidateException {
        return ResponseEntity.ok(offerService.getOffersOrderedByDistanceToUser(page, latitude, longitude, currentDay, searchKeyword, offerType));
    }

    @GetMapping("/details/{offerId}")
    @Operation(
            summary = "Get offer details",
            description = "Retrieve detailed information about a specific offer, including its proximity to the user's location."
    )
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<OfferMobileDetailDto> getOfferDetails(@PathVariable("offerId") UUID offerId, @RequestParam Double latitude,
                                                                @RequestParam Double longitude,
                                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate currentDay) throws DtoValidateNotFoundException {
        return ResponseEntity.ok(offerService.getOfferDetails(offerId, latitude, longitude, currentDay));
    }

    @DeleteMapping("/delete")
    @Operation(
            summary = "Delete offers",
            description = "Delete one or more offers based on the provided list of offer IDs."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Void> deleteOffers(@RequestBody DeleteOffersDto deleteOffersDto) throws DtoValidateException {
        offerService.deleteOffers(deleteOffersDto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reactivate")
    @Operation(
            summary = "Reactivate an offer",
            description = "Reactivate a previously suspended or rejected offer, making it active again."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Void> reactivateOffer(@RequestBody ReactivateOfferDto reactivateOfferDto,
                                                @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language)
            throws DtoValidateException {

        // to be moved in service
        Offer reactivatedOffer = offerService.reactivateOffer(reactivateOfferDto);

        User user = principalService.getUser();
        UUID tenantId = principalService.getTenantId();

        offerService.sendReviewOfferEmail(tenantId, language, user);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/filter")
    @Operation(
            summary = "Filter offers",
            description = "Retrieve a paginated list of offers based on various filter criteria provided in the request parameters."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public List<OfferViewTableDto> filterOffers(@ModelAttribute FilterOfferRequestDto filterParams,
                                                @RequestParam(defaultValue = "0") Integer pageIndex,
                                                @RequestParam(defaultValue = "25") Integer pageSize) {
        return offerService.getFilteredOffers(filterParams, pageIndex, pageSize);
    }

    @GetMapping("/filter/count")
    @Operation(
            summary = "Count filtered offers",
            description = "Get the total count of offers that match the specified filter criteria."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Integer> countFilteredOffers(@ModelAttribute FilterOfferRequestDto filterParams) {
        Integer count = offerService.countFilteredOffers(filterParams);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/full/{offerId}")
    @Operation(
            summary = "Get full offer details",
            description = "Retrieve comprehensive details of a specific offer, including all relevant information and associations."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferDto> getFullOffer(@PathVariable("offerId") UUID offerId) throws DtoValidateException {
        return ResponseEntity.ok(offerService.getFullOffer(offerId));
    }

    @PostMapping(path = "/reject")
    @Operation(
            summary = "Reject an offer",
            description = "Reject a pending offer, providing a reason for the rejection."
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Void> rejectOffer(@RequestBody RejectOfferDto rejectOfferDto,
                                            @CookieValue(value = "language_municipality", defaultValue = "nl-NL") String language) throws DtoValidateException {

        offerService.rejectOffer(rejectOfferDto, language);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/rejection/{offerId}")
    @Operation(
            summary = "Get offer rejection reason",
            description = "Retrieve the reason for rejection of a specific offer, if it has been rejected."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferRejectionReasonDto> getOfferRejectionReason(@PathVariable("offerId") UUID offerId) throws DtoValidateException {
        return ResponseEntity.ok(offerService.getOfferRejectionReason(offerId));
    }

    @GetMapping(path = "/status/counts/{timeIntervalPeriod}")
    @Operation(
            summary = "Get offer counts by status",
            description = "Retrieve the count of offers grouped by their status for the authenticated supplier, filtered by the specified time interval."
    )
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferStatusCountsDto> getOfferCountsByStatus(@PathVariable TimeIntervalPeriod timeIntervalPeriod) {
        // principalService.getSupplierId(): to be used from service
        UUID supplierId = principalService.getSupplierId();

        return ResponseEntity.ok(offerService.getOfferCountsByStatus(supplierId, timeIntervalPeriod));
    }

    @GetMapping(path = "/search")
    @Operation(
            summary = "Search offers by keyword",
            description = "Search for offers that match the specified keyword in their title or description."
    )
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<List<String>> searchOffersByKeyword(
            @RequestParam("searchKeyword") @Size(min = 3, max = 100, message = "Search keyword must have at least 3 and maximum 100 characters") String searchKeyword) {
        return ResponseEntity.ok(offerService.searchOffersByKeyword(searchKeyword));
    }
}
