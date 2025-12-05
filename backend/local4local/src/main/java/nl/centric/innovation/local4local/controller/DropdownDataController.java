package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.DropdownDataFilterDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.interfaces.DropdownDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dropdowns")
@RequiredArgsConstructor
public class DropdownDataController {

    private final DropdownDataService dropdownDataService;

    @GetMapping("/offer-filter")
    @Secured({Role.ROLE_SUPPLIER})
    public ResponseEntity<DropdownDataFilterDto> getAllDropdownsData() {
        return ResponseEntity.ok(dropdownDataService.getAllDropdownsData());
    }
}
