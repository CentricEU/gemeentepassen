package nl.centric.innovation.local4local.config;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.BenefitRepository;
import nl.centric.innovation.local4local.repository.OfferRepositoryCustom;
import nl.centric.innovation.local4local.repository.OfferSearchHistoryRepositoryCustom;
import nl.centric.innovation.local4local.repository.RecoverPasswordRepositoryCustom;
import nl.centric.innovation.local4local.service.interfaces.BankHolidaysService;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.Year;
import java.util.Date;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@EnableScheduling
@RequiredArgsConstructor
public class SchedulerCron {

    private final RecoverPasswordRepositoryCustom recoverPasswordService;

    private final OfferRepositoryCustom offerRepository;

    private final BenefitRepository benefitRepository;

    private final BankHolidaysService bankHolidaysService;

    private final OfferSearchHistoryRepositoryCustom offerSearchHistoryRepositoryCustom;
    private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");

    //will execute on every Monday at 1am
    @Scheduled(cron = "0 0 1 * * MON")
    public void taskToClearUserActivity() {
        log.info("Scheduler ClearPasswordRecoveryRequests task started at : " + sdf.format(new Date()));
        recoverPasswordService.removeOldEntries();
    }

    //will execute on each day at 2:30am
    @Scheduled(cron = "0 30 2 * * *")
    public void taskToUpdateOfferStatus() {
        log.info("Scheduler Change Offer Status task started at : " + sdf.format(new Date()));
        offerRepository.updateOfferStatus();
    }

    //will execute on each day at 2:30am
    @Scheduled(cron = "0 30 2 * * *")
    public void taskToUpdateBenefitStatus() {
        log.info("Scheduler Change Benefit Status task started at : " + sdf.format(new Date()));
        benefitRepository.updateBenefitStatus();
    }

    //will execute on 31 December at 3:30am
    @Scheduled(cron = "0 30 3 31 12 *")
    public void taskToGetBankHolidays() {
        log.info("Scheduler Get Bank Holidays task started at : " + sdf.format(new Date()));
        Integer currentYear = Year.now().getValue();

        try {
            bankHolidaysService.getBankHolidaysFromApi(currentYear);
            bankHolidaysService.getBankHolidaysFromApi(currentYear + 1);
        } catch (DtoValidateException | IOException | InterruptedException e) {
            log.error("Error while Getting Bank Holidays: ");
            log.error(e.getMessage());
        }
    }


    //will execute on each day at 2:30am
    @Scheduled(cron = "0 30 2 * * *")
    public void taskToDeleteOfferSearchHistory() {
        log.info("Scheduler Delete Offer Search History task started at : " + sdf.format(new Date()));
        offerSearchHistoryRepositoryCustom.cleanupOfferSearchHistory();
    }

}