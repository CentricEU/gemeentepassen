package nl.centric.innovation.local4local.controller;


import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.impl.OfferSearchHistoryService;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/search-history")
@RequiredArgsConstructor
public class OfferSearchHistoryController {

    private final OfferSearchHistoryService offerSearchHistoryService;

    @GetMapping()
    @Secured({Role.ROLE_CITIZEN})
    @Operation(summary = "Get search history for citizen",
            description = "Retrieve the top 5 most recent search history of the logged-in citizen.")
    public List<String> getSearchHistoryForCitizen() {
        return offerSearchHistoryService.getSearchHistoryForCitizen();
    }
}
