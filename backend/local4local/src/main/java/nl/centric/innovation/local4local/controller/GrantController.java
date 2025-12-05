package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.GrantRequestDto;
import nl.centric.innovation.local4local.dto.GrantViewDto;
import nl.centric.innovation.local4local.dto.GrantViewDtoTable;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.service.impl.GrantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/grants")
public class GrantController {

    private final GrantService grantService;

    @PostMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<GrantViewDto> createGrant(@Valid @RequestBody GrantRequestDto grantRequestDto)
            throws DtoValidateException {
        return ResponseEntity.ok(grantService.createGrant(grantRequestDto));
    }

    @GetMapping("/paginated")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<GrantViewDtoTable>> getAllByTenantIdPaginated(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size,
            @CookieValue(value = "language", defaultValue = "nl-NL") String language) {
        return ResponseEntity.ok(grantService.getAllPaginated(page, size, language));
    }

    @GetMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPPLIER})
    public ResponseEntity<List<GrantViewDto>> getAllByTenantId(@RequestParam Boolean isActiveGrantNeeded) {
        return ResponseEntity.ok(grantService.getAll(isActiveGrantNeeded));
    }

    @GetMapping("/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Integer> countAllByTenantId() {
        return ResponseEntity.ok(grantService.countAll());
    }

    @PatchMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<GrantViewDto> editGrant(@RequestBody @Valid GrantViewDto grantViewDto)
            throws DtoValidateException {
        return ResponseEntity.ok(grantService.editGrant(grantViewDto));
    }

}
