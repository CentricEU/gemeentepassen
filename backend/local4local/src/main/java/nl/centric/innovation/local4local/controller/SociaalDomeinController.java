package nl.centric.innovation.local4local.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.impl.SociaalDomeinService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("sociaal-domein")
@RequiredArgsConstructor
public class SociaalDomeinController {

    private final SociaalDomeinService sociaalDomeinService;

    @GetMapping("/token")
    @Secured({Role.ROLE_CITIZEN})
    @Operation(
            summary = "Get Sociaal Domein Token",
            description = "Retrieves a valid token for accessing Sociaal Domein services."
    )
    public ResponseEntity<String> getToken() {
        String token = sociaalDomeinService.getToken();
        return ResponseEntity.ok(token);
    }
}
