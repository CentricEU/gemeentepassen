package nl.centric.innovation.local4local.controller;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.BankHoliday;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.service.interfaces.BankHolidaysService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bank-holidays")
@RequiredArgsConstructor
public class BankHolidaysController {

    private final BankHolidaysService bankHolidaysService;

    @GetMapping()
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<List<BankHoliday>> getBankHolidaysForYear(@RequestParam Integer year) {
        List<BankHoliday> response = bankHolidaysService.getAllBankHolidaysForYear(year);
        return ResponseEntity.ok(response);
    }
}
