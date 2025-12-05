package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.entity.BankHoliday;
import nl.centric.innovation.local4local.repository.BankHolidayRepository;
import nl.centric.innovation.local4local.service.impl.BankHolidaysServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)

public class BankingHolidaysServiceImplTests {

    @InjectMocks
    private BankHolidaysServiceImpl bankHolidaysService;
    @Mock
    private BankHolidayRepository bankHolidayRepository;

    private String apiURL = "https://date.nager.at/api/v3/publicholidays/";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bankHolidaysService, "apiURL", apiURL);
    }

    @Test
    @SneakyThrows
    public void GivenPresentYear_WhenGetBankHolidaysFromApi_ThanNoSave() {
        Integer year = 2024;
        when(bankHolidayRepository.countByYear(year)).thenReturn(1);

        bankHolidaysService.getBankHolidaysFromApi(year);

        verify(bankHolidayRepository, never()).saveAll(any());

    }

    @Test
    @SneakyThrows
    public void GivenNotPresentYear_WhenGetBankHolidaysFromApi_ThanShouldSave() {
        Integer year = 2024;
        when(bankHolidayRepository.countByYear(year)).thenReturn(0);

        List<BankHoliday> holidays = new ArrayList<>();
        holidays.add(new BankHoliday());
        when(bankHolidayRepository.saveAll(any())).thenReturn(holidays);

        bankHolidaysService.getBankHolidaysFromApi(year);

        verify(bankHolidayRepository, times(1)).saveAll(any());
    }

    @Test
    public void GivenPresentYear_WhenGetAllBankHolidaysForYear_ShouldReturn() {
        Integer year = 2024;
        List<BankHoliday> holidays = new ArrayList<>();
        when(bankHolidayRepository.getAllByYear(year)).thenReturn(holidays);

        List<BankHoliday> result = bankHolidaysService.getAllBankHolidaysForYear(year);

        assertEquals(holidays, result);
        verify(bankHolidayRepository, times(1)).getAllByYear(year);
    }

}
