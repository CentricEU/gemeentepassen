package nl.centric.innovation.local4local.service.interfaces;

import nl.centric.innovation.local4local.dto.InviteSupplierDto;
import nl.centric.innovation.local4local.entity.BankHoliday;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface BankHolidaysService {
    void getBankHolidaysFromApi(Integer year) throws DtoValidateException, IOException, InterruptedException;

    List<BankHoliday> getAllBankHolidaysForYear(Integer year);
}
