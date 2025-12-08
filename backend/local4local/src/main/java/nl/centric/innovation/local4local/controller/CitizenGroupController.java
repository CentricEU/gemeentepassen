package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CitizenGroupDto;
import nl.centric.innovation.local4local.dto.CitizenGroupViewDto;
import nl.centric.innovation.local4local.dto.CitizenMessageDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.enums.RequiredDocuments;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.service.impl.CitizenGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/citizen-groups")
@Validated
public class CitizenGroupController {

    private final CitizenGroupService citizenGroupService;

    @PostMapping
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Create a new citizen group",
            description = "Allows a Municipality Admin to create a new citizen group. " +
                    "The request requires valid authentication and the role `ROLE_MUNICIPALITY_ADMIN`."
    )
    public ResponseEntity<CitizenGroupDto> save(@RequestBody @Valid CitizenGroupDto citizenGroup) throws DtoValidateException {
        return ResponseEntity.status(HttpStatus.CREATED).body(citizenGroupService.save(citizenGroup));
    }

    @GetMapping("/paginated")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Retrieve paginated citizen groups",
            description = "Allows a Municipality Admin to retrieve a paginated list of citizen groups associated with their tenant."
    )
    public ResponseEntity<List<CitizenGroupViewDto>> getAllByTenantIdPaginated(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size) {
        return ResponseEntity.ok(citizenGroupService.getAllByTenantIdPaginated(page, size));
    }

    @GetMapping
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_CITIZEN})
    @Operation(
            summary = "Retrieve all citizen groups",
            description = "Returns a list of all citizen groups associated with the tenant of the currently authenticated user. " +
                    "If the user has the Citizen role, only groups with at least one associated benefit are included."
    )
    public ResponseEntity<List<CitizenGroupViewDto>> getAllByTenantId() {
        return ResponseEntity.ok(citizenGroupService.getAllByTenantId());
    }

    @GetMapping("/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Count citizen groups",
            description = "Allows a Municipality Admin to count all citizen groups associated with their tenant"
    )
    public ResponseEntity<Long> countAllByTenantId() {
        return ResponseEntity.ok(citizenGroupService.countAllByTenantId());
    }

    @PostMapping("/assignment")
    @Secured({Role.ROLE_CITIZEN})
    //Todo: Check if this should be allowed?!
    @Operation(
            summary = "Assign citizen group to citizen",
            description = "Allows a Citizen to assign themselves to a citizen group."
    )
    public ResponseEntity<Void> assignCitizenGroupToUser(
            @RequestParam(name = "categoryId") @NotNull(message = "Category ID must not be null") UUID categoryId) throws DtoValidateException {
        citizenGroupService.assignCitizenGroupToCitizen(categoryId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/documents")
    @Secured({Role.ROLE_CITIZEN})
    @Operation(
            summary = "Retrieve citizen group required documents",
            description = "Allows a Citizen to retrieve a list of required documents for their assigned citizen groups."
    )
    public ResponseEntity<List<RequiredDocuments>> getAllRequiredDocuments() throws DtoValidateNotFoundException {
        return ResponseEntity.ok(citizenGroupService.getAllRequiredDocuments());
    }

    @PostMapping("/none-category-fit")
    @Secured({Role.ROLE_CITIZEN})
    @Operation(
            summary = "Send an email from citizen",
            description = "Allows a Citizen to send a custom message to his municipality."
    )
    public ResponseEntity<Void> sendCitizenMessage(
            @RequestBody @Valid CitizenMessageDto citizenMessage) throws DtoValidateNotFoundException {
        citizenGroupService.sendCitizenMessage(citizenMessage.message());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
