package nl.centric.innovation.local4local.controller;

import java.util.List;
import java.util.UUID;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.service.impl.PassholderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.CsvManipulationException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;

@RestController
@RequestMapping("/passholders")
@RequiredArgsConstructor
public class PassholderController {

    private final PassholderService passholderService;

    @Operation(
            summary = "Upload Passholders CSV",
            description = "Upload a CSV file containing passholder data to create multiple passholders at once."
    )
    @PostMapping(value = "/upload")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> uploadFile(
            @RequestPart("file") MultipartFile file,
            @NotNull(message = "Citizen group id must not be null") @RequestParam UUID citizenGroupId)
            throws CsvManipulationException, DtoValidateException {
        passholderService.saveFromCSVFile(file, citizenGroupId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(
            summary = "Update Passholder",
            description = "Update the details of an existing passholder."
    )
    @PutMapping
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
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
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> deletePassholder(@PathVariable("passholderId") UUID passholderId)
            throws DtoValidateException {

        passholderService.deletePassholder(passholderId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get All Passholders",
            description = "Retrieve a paginated list of all passholders."
    )
    @GetMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<PassholderViewDto>> getAllByTenantId(@RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(defaultValue = "25") Integer size) {
        List<PassholderViewDto> response = passholderService.getAll(page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Count All Passholders",
            description = "Get the total count of all passholders."
    )
    @GetMapping("/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Integer> countAllByTenantId() {
        return ResponseEntity.ok(passholderService.countAll());
    }


}
