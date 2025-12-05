package nl.centric.innovation.local4local.service.impl;


import com.google.common.reflect.TypeToken;
import com.nimbusds.jose.shaded.gson.Gson;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.BankHolidayApiResponseDto;
import nl.centric.innovation.local4local.entity.BankHoliday;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.BankHolidayRepository;
import nl.centric.innovation.local4local.service.interfaces.BankHolidaysService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:application.properties"})
public class BankHolidaysServiceImpl implements BankHolidaysService {

    @Value("${bank.holidays.api.url}")
    private String apiURL;

    private final BankHolidayRepository bankHolidayRepository;

    @Override
    public void getBankHolidaysFromApi(Integer year) throws DtoValidateException, IOException, InterruptedException {
        Integer holidaysCountForYear = bankHolidayRepository.countByYear(year);
        if (holidaysCountForYear > 0) {
            return;
        }
        String computedApiUrl = apiURL + year.toString() + "/NL";
        List<BankHolidayApiResponseDto> apiResponse = callHolidaysApi(computedApiUrl);
        List<BankHoliday> convertedHolidays = apiResponse.stream().map(BankHoliday::bankHolidayApiResponseToEntity).collect(Collectors.toList());
        saveAllBankingHolidays(convertedHolidays, year);
    }

    @Override
    public List<BankHoliday> getAllBankHolidaysForYear(Integer year) {
        return bankHolidayRepository.getAllByYear(year);
    }

    private List<BankHolidayApiResponseDto> callHolidaysApi(String url) throws IOException, InterruptedException {

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).header("Accept", "text/*").build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        String responseBody = response.body();

        TypeToken<List<BankHolidayApiResponseDto>> typeToken = new TypeToken<List<BankHolidayApiResponseDto>>() {
        };
        Gson gson = new Gson();
        List<BankHolidayApiResponseDto> holidaysFromApi = gson.fromJson(responseBody, typeToken.getType());

        return holidaysFromApi;
    }

    private void saveAllBankingHolidays(List<BankHoliday> bankingHolidays, Integer year) {
        bankHolidayRepository.saveAll(bankingHolidays);
    }
}
