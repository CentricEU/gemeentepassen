package nl.centric.innovation.local4local.entity;

import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.enums.FrequencyOfUse;
import nl.centric.innovation.local4local.util.DateUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Table;
import java.sql.Time;
import java.time.LocalDateTime;
import java.util.Objects;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_global", name = "restrictions")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "pgsql_enum", typeClass = PostgreSQLEnumType.class)
public class Restriction extends BaseEntity {

    @Column(columnDefinition = "age_restriction")
    private Integer ageRestriction;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "frequency_of_use")
    @Type(type = "pgsql_enum")
    private FrequencyOfUse frequencyOfUse;

    @Column(name = "min_price")
    private Integer minPrice;

    @Column(name = "max_price")
    private Integer maxPrice;

    // Remember time is in UTC saved even if in the frontend is CET
    @Column(name = "time_from")
    private Time timeFrom;

    @Column(name = "time_to")
    private Time timeTo;

    public boolean isRestrictionWithoutValidConditions() {
        boolean requiredToCheckRestrictions = ObjectUtils.allNull(
                this.getFrequencyOfUse(),
                this.getTimeFrom(),
                this.getTimeTo(),
                this.getMinPrice(),
                this.getMaxPrice()
        );

        boolean hasAgeRestrictions = !Objects.isNull(this.getAgeRestriction());

        return requiredToCheckRestrictions && hasAgeRestrictions;
    }

    public boolean isTimeOutsideRange(Time currentTime) {
        Time timeFrom = this.getTimeFrom();
        Time timeTo = this.getTimeTo();

        if (Objects.isNull(timeFrom) && Objects.isNull(timeTo)) {
            return false;
        }

        boolean isBeforeStart = currentTime.compareTo(timeFrom) < 0;
        boolean isAfterEnd = currentTime.compareTo(timeTo) > 0;

        return isBeforeStart || isAfterEnd;
    }

    public boolean isFrequencyViolated(LocalDateTime lastTransactionDate) {
        if (Objects.isNull(this.frequencyOfUse) || Objects.isNull(lastTransactionDate)) {
            return false;
        }

        return switch (this.frequencyOfUse) {
            case DAILY -> !DateUtils.isDateBeforeToday(lastTransactionDate);
            case MONTHLY -> !DateUtils.isDateBeforeMonth(lastTransactionDate);
            case WEEKLY -> !DateUtils.isDateBeforeWeek(lastTransactionDate);
            case YEARLY -> !DateUtils.isDateBeforeYear(lastTransactionDate);
            case SINGLE_USE -> false;
            default -> false;
        };
    }

    public boolean isPriceViolated(Double price) {
        if (Objects.isNull(this.minPrice) && Objects.isNull(this.maxPrice)) {
            return false;
        }

        boolean isBelowMin = price < this.minPrice;
        boolean isAboveMax = price > this.maxPrice;

        return isBelowMin || isAboveMax;
    }
}
