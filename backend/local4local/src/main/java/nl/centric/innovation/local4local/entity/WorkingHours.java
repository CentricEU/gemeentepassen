package nl.centric.innovation.local4local.entity;

import java.io.Serial;
import java.io.Serializable;
import java.sql.Time;
import java.time.LocalTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.WorkingHoursCreateDto;
import nl.centric.innovation.local4local.dto.WorkingHoursDto;

@Entity
@Table(schema = "l4l_global", name = "working_hours")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkingHours implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "day")
    private Integer day;

    @Column(name = "open_time")
    private Time openTime;

    @Column(name = "close_time")
    private Time closeTime;

    @Column(name = "is_checked")
    private Boolean isChecked;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    @JsonIgnore
    private Supplier supplier;

    @Builder
    public WorkingHours(UUID id, Integer day, Boolean isChecked, Supplier supplier, String openTime, String closeTime) {
        this.id = id;
        this.day = day;
        this.isChecked = isChecked;
        this.supplier = supplier;
        this.openTime = openTime != null ? Time.valueOf(openTime) : Time.valueOf(LocalTime.MIDNIGHT);
        this.closeTime = closeTime != null ? Time.valueOf(closeTime) : Time.valueOf(LocalTime.MIDNIGHT);
    }

    public static WorkingHours workingHoursDtoToEntity(WorkingHoursDto workingHoursDto, Supplier supplier) {

        return WorkingHours.builder()
                .openTime(workingHoursDto.openTime())
                .closeTime(workingHoursDto.closeTime())
                .day(workingHoursDto.day())
                .isChecked(workingHoursDto.isChecked())
                .supplier(supplier)
                .id(workingHoursDto.id())
                .build();
    }

    public static WorkingHours workingHoursCreateDtoToEntity(WorkingHoursCreateDto workingHoursDto, Supplier supplier) {

        return WorkingHours.builder()
                .openTime(workingHoursDto.openTime())
                .closeTime(workingHoursDto.closeTime())
                .day(workingHoursDto.day())
                .isChecked(workingHoursDto.isChecked())
                .supplier(supplier)
                .build();
    }

}
