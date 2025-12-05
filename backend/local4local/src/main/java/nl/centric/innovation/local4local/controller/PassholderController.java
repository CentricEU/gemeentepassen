package nl.centric.innovation.local4local.controller;

import java.util.List;
import java.util.UUID;

import javax.validation.Valid;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.AssignPassholderGrantsDto;
import nl.centric.innovation.local4local.service.impl.PassholderService;
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
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.CsvManipulationException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;

@RestController
@RequestMapping("/passholders")
@RequiredArgsConstructor
public class PassholderController {

    private final PassholderService passholderService;

    @PostMapping(value = "/upload")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<Passholder>> uploadFile(@RequestPart("file") MultipartFile file)
            throws CsvManipulationException, DtoValidateException {
        List<Passholder> savedPassholders = passholderService.saveFromCSVFile(file);
        return ResponseEntity.ok(savedPassholders);
    }

    @PutMapping
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> updatePassholder(@Valid @RequestBody PassholderViewDto passholder)
            throws DtoValidateException {

        passholderService.updatePassholder(passholder);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/assign")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> assignGrants(@Valid @RequestBody AssignPassholderGrantsDto assignPassholderGrantsDto)
            throws DtoValidateException {

        passholderService.assignPassholders(assignPassholderGrantsDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{passholderId}")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> deletePassholder(@PathVariable("passholderId") UUID passholderId)
            throws DtoValidateException {

        passholderService.deletePassholder(passholderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<PassholderViewDto>> getAllByTenantId(@RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(defaultValue = "25") Integer size) {
        List<PassholderViewDto> response = passholderService.getAll(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Integer> countAllByTenantId() {
        return ResponseEntity.ok(passholderService.countAll());
    }


}
