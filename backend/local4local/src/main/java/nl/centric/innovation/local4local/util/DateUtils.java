package nl.centric.innovation.local4local.util;

import nl.centric.innovation.local4local.enums.TimeIntervalPeriod;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

public class DateUtils {

    private static final Map<String, String> PATTERNS = new HashMap<>();

    static {
        PATTERNS.put("TIME", "HH:mm");
        PATTERNS.put("DATE_DEFAULT", "dd/MM/yyyy");
        PATTERNS.put("DATETIME_DEFAULT", "MM/dd/yyyy, HH:mm:ss");
    }

    public static boolean isDateBeforeToday(LocalDateTime dateTime) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        return dateTime.isBefore(today);
    }

    public static boolean isDateBeforeWeek(LocalDateTime dateTime) {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return dateTime.isBefore(startOfWeek);
    }

    public static boolean isDateBeforeMonth(LocalDateTime dateTime) {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return dateTime.isBefore(startOfMonth);
    }

    public static boolean isDateBeforeYear(LocalDateTime dateTime) {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfYear = today.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return dateTime.isBefore(startOfYear);
    }

    public static LocalDateTime calculateQuarterlyStartDate(LocalDateTime currentDate) {
        LocalDateTime threeMonthsAgoDate = currentDate.minusMonths(3).withDayOfMonth(1);

        if (threeMonthsAgoDate.getYear() < currentDate.getYear()) {
            return LocalDateTime.of(currentDate.getYear(), 1, 1, 0, 0, 0);
        } else {
            return toStartOfDay(threeMonthsAgoDate);
        }
    }

    public static LocalDateTime toStartOfDay(LocalDateTime dateTime) {
        return dateTime.withHour(0).withMinute(0).withSecond(0).withNano(0);
    }

    public static String formatTime(LocalTime time) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(PATTERNS.get("TIME"));
        return time.format(formatter);
    }

    public static String formatDateDefault(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(PATTERNS.get("DATE_DEFAULT"));
        return date.format(formatter);
    }

    public static LocalDateTime formatToLocalDateTime(String date) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(PATTERNS.get("DATETIME_DEFAULT"));
        return LocalDateTime.parse(date, formatter);
    }

    public static LocalDate getLastDayOfMonth(LocalDate firstDay) {
        YearMonth yearMonth = YearMonth.of(firstDay.getYear(), firstDay.getMonth());
        return yearMonth.atEndOfMonth();
    }

    public static DateTimeFormatter getDefaultDateTimeFormatter() {
        return DateTimeFormatter.ofPattern(PATTERNS.get("DATE_DEFAULT"));
    }

    public static LocalDateTime calculateCreatedDate(TimeIntervalPeriod period) {
        LocalDateTime now = LocalDateTime.now();

        return switch (period) {
            case MONTHLY -> DateUtils.toStartOfDay(now.withDayOfMonth(1));
            case QUARTERLY -> DateUtils.calculateQuarterlyStartDate(now);
            case YEARLY -> DateUtils.toStartOfDay(now.withDayOfYear(1));
        };
    }

}
