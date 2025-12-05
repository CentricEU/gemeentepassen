package nl.centric.innovation.local4local.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.BankHolidayApiResponseDto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Entity
@Table(schema = "l4l_global", name = "bank_holiday")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankHoliday {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "local_name", nullable = false)
    private String localName;

    @Column(name = "country_code", nullable = false)
    private String countryCode;

    @Column(name = "day_date", nullable = false)
    private LocalDate date;

    @Column(name = "year", nullable = false)
    private Integer year;

    public static BankHoliday bankHolidayApiResponseToEntity(BankHolidayApiResponseDto apiResponse) {
        DateTimeFormatter format = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate localDate = LocalDate.parse(apiResponse.date(), format);

        return BankHoliday.builder()
                .countryCode(apiResponse.countryCode())
                .localName(apiResponse.localName())
                .date(localDate)
                .year(localDate.getYear())
                .build();
    }
}
