package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.InvitationDto;
import nl.centric.innovation.local4local.dto.InviteSupplierDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.service.impl.InviteSupplierServiceImpl;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/invitations")
public class InviteSupplierController {

    private final InviteSupplierServiceImpl inviteSupplierService;

    private final PrincipalService principalService;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @PostMapping("/send")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> inviteSupplier(@RequestBody InviteSupplierDto inviteSupplierDto,
                                               @CookieValue(value = "language", defaultValue = "nl-NL") String language) throws DtoValidateException {

        inviteSupplierService.inviteSupplier(inviteSupplierDto, language);
        return ResponseEntity.ok().build();
    }

    @GetMapping()
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<List<InvitationDto>> getInvitations(@RequestParam(defaultValue = "0") Integer page,
                                                              @RequestParam(defaultValue = "25") Integer size) {
        return ResponseEntity.ok(inviteSupplierService.getAllLatestSentToEmailByTenantId(page, size));
    }

    @GetMapping("/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Integer> countInvitationsByTenantId() {
        return ResponseEntity.ok(inviteSupplierService.countByTenantId());
    }

}
