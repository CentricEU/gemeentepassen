package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.DeleteOffersDto;
import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.dto.OfferMobileDetailDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightDto;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import javax.validation.constraints.Size;
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
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<List<OfferType>> getAllOfferTypes() {
        return ResponseEntity.ok(offerTypeService.getAllOfferTypes());
    }

    @PostMapping()
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferViewDto> createOffer(@Valid @RequestBody OfferRequestDto offerRequestDto,
                                                    @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language) throws DtoValidateException {

        OfferViewDto result = offerService.createOffer(offerRequestDto, language);

        return ResponseEntity.ok(result);
    }

    @PostMapping(path = "/use")
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<Void> useOffer(@Valid @RequestBody OfferUsageRequestDto offerUsageRequestDto) throws DtoValidateException {

        offerService.useOffer(offerUsageRequestDto);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/approve/{offerId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> approveOffer(@PathVariable("offerId") UUID offerId,
                                             @CookieValue(value = "language_municipality", defaultValue = "nl-NL") String language) throws DtoValidateException {

        offerService.approveOffer(offerId, language);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<List<OfferViewTableDto>> getAllForSupplierPaginated(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size) {
        List<OfferViewTableDto> response = offerService.getAll(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supplier/{supplierId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
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
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Integer> countAllBySupplierId() {
        return ResponseEntity.ok(offerService.countAll());
    }

    @GetMapping("/tenant")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<OfferViewTableDto>> getAllByTenantId(@RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(defaultValue = "25") Integer size) {
        List<OfferViewTableDto> response = offerService.getAllForTenantPaginated(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supplier/{supplierId}/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Integer> countAllBySupplierId(@PathVariable("supplierId") UUID supplierId) throws DtoValidateNotFoundException {
        // to be moved in service
        Optional<Supplier> supplier = supplierService.findBySupplierId(supplierId);

        if (supplier.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return ResponseEntity.ok(offerService.countAllBySupplierId(supplierId));
    }

    @GetMapping("/tenant/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Integer> countAllByTenantId() {
        return ResponseEntity.ok(offerService.countAllForTenantId());
    }


    @GetMapping("/map-with-viewport")
    @Secured({Role.ROLE_CITIZEN})
    @Operation(summary = "Get offers within viewport",
            description = "Retrieve offers within the specified geographical viewport.")
    public ResponseEntity<Map<String, List<OfferMobileMapLightDto>>> getOffersWithinViewport(
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
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<OfferMobileDetailDto> getOfferDetails(@PathVariable("offerId") UUID offerId, @RequestParam Double latitude,
                                                                @RequestParam Double longitude,
                                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate currentDay) throws DtoValidateNotFoundException {
        return ResponseEntity.ok(offerService.getOfferDetails(offerId, latitude, longitude, currentDay));
    }

    @DeleteMapping("/delete")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Void> deleteOffers(@RequestBody DeleteOffersDto deleteOffersDto) {
        offerService.deleteOffers(deleteOffersDto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reactivate")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Void> reactivateOffer(@RequestBody ReactivateOfferDto reactivateOfferDto,
                                                @CookieValue(value = "language_supplier", defaultValue = "nl-NL") String language)
            throws DtoValidateException {

        // to be moved in service
        Offer reactivatedOffer = offerService.reactivateOffer(reactivateOfferDto);

        if (reactivatedOffer.getOfferType().getOfferTypeId() == 0) {
            User user = principalService.getUser();
            UUID tenantId = principalService.getTenantId();

            offerService.sendReviewOfferEmail(tenantId, language, user);
        }

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/filter")
    @Secured({Role.ROLE_SUPPLIER})
    public List<OfferViewTableDto> filterOffers(@ModelAttribute FilterOfferRequestDto filterParams,
                                                @RequestParam(defaultValue = "0") Integer pageIndex,
                                                @RequestParam(defaultValue = "25") Integer pageSize) {
        return offerService.getFilteredOffers(filterParams, pageIndex, pageSize);
    }

    @GetMapping("/filter/count")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<Integer> countFilteredOffers(@ModelAttribute FilterOfferRequestDto filterParams) {
        Integer count = offerService.countFilteredOffers(filterParams);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/full/{offerId}")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferDto> getFullOffer(@PathVariable("offerId") UUID offerId) throws DtoValidateException {
        return ResponseEntity.ok(offerService.getFullOffer(offerId));
    }

    @PostMapping(path = "/reject")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> rejectOffer(@RequestBody RejectOfferDto rejectOfferDto,
                                            @CookieValue(value = "language_municipality", defaultValue = "nl-NL") String language) throws DtoValidateException {

        offerService.rejectOffer(rejectOfferDto, language);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/rejection/{offerId}")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferRejectionReasonDto> getOfferRejectionReason(@PathVariable("offerId") UUID offerId) throws DtoValidateException {
        return ResponseEntity.ok(offerService.getOfferRejectionReason(offerId));
    }

    @GetMapping(path = "/status/counts/{timeIntervalPeriod}")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<OfferStatusCountsDto> getOfferCountsByStatus(@PathVariable TimeIntervalPeriod timeIntervalPeriod) {
        // principalService.getSupplierId(): to be used from service
        UUID supplierId = principalService.getSupplierId();

        return ResponseEntity.ok(offerService.getOfferCountsByStatus(supplierId, timeIntervalPeriod));
    }

    @GetMapping(path = "/search")
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<List<String>> searchOffersByKeyword(
            @RequestParam("searchKeyword") @Size(min = 3, max = 100, message = "Search keyword must have at least 3 and maximum 100 characters") String searchKeyword) {
        return ResponseEntity.ok(offerService.searchOffersByKeyword(searchKeyword));
    }
}
