package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.FilterPassholdersRequestDto;
import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.CsvManipulationException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.PassholderService;
import nl.centric.innovation.local4local.service.impl.RegistrationService;
import nl.centric.innovation.local4local.service.impl.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/passholders")
@RequiredArgsConstructor
public class PassholderController {

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    private final PassholderService passholderService;

    private final UserService userService;


    private final RegistrationService registrationService;

    @Operation(
            summary = "Upload Passholders CSV",
            description = "Upload a CSV file containing passholder data to create multiple passholders at once."
    )
    @PostMapping(value = "/upload")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Void> uploadFile(
            @RequestPart("file") MultipartFile file,
            @NotNull(message = "Citizen group id must not be null") @RequestParam UUID citizenGroupId)
            throws CsvManipulationException, DtoValidateException {
        try {
            registrationService.saveFromCSVFile(file, citizenGroupId);
        } catch (RuntimeException e) {
            throw new CsvManipulationException(errorEntityValidate);
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(
            summary = "Update Passholder",
            description = "Update the details of an existing passholder."
    )
    @PutMapping
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    // Todo: change to PatchMapping and create another dto for partial updates
    public ResponseEntity<Void> updatePassholder(@Valid @RequestBody PassholderViewDto passholder)
            throws DtoValidateException {

        passholderService.updatePassholder(passholder);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Delete Passholder",
            description = "Delete a passholder by their unique identifier."
    )
    @DeleteMapping("/{passholderId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Void> deletePassholder(@PathVariable("passholderId") UUID passholderId)
            throws DtoValidateException {

        userService.deletePassholder(passholderId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get All Passholders",
            description = "Retrieve a paginated list of all passholders."
    )
    @GetMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<List<PassholderViewDto>> getAllByTenantId(@RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(defaultValue = "25") Integer size) {
        List<PassholderViewDto> response = passholderService.getAll(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{passholderId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<PassholderViewDto> getPassholderDetails(@PathVariable("passholderId") UUID passholderId) throws DtoValidateNotFoundException {
        PassholderViewDto response = passholderService.getPassholderDetails(passholderId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Count All Passholders",
            description = "Get the total count of all passholders."
    )
    @GetMapping("/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Integer> countAllByTenantId() {
        return ResponseEntity.ok(passholderService.countAll());
    }

    @Operation(
            summary = "Filter Passholders",
            description = "Retrieve a paginated list of passholders based on filter criteria."
    )
    @GetMapping("/filter")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public List<PassholderViewDto> filterPassholders(@ModelAttribute FilterPassholdersRequestDto filterParams,
                                                     @RequestParam(defaultValue = "0") Integer pageIndex,
                                                     @RequestParam(defaultValue = "25") Integer pageSize) {
        return passholderService.getFilteredPassholders(filterParams, pageIndex, pageSize);
    }

    @Operation(
            summary = "Count Filtered Passholders",
            description = "Get the count of passholders that match the filter criteria."
    )
    @GetMapping("/filter/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN})
    public ResponseEntity<Integer> countFilteredPassholders(@ModelAttribute FilterPassholdersRequestDto filterParams) {
        Integer count = passholderService.countFilteredPassholders(filterParams);
        return ResponseEntity.ok(count);
    }


}
