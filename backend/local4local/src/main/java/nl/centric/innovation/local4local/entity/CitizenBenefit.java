package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.Setter;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "l4l_global", name = "citizen_benefit")
public class CitizenBenefit extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "benefit_id", nullable = false)
    private Benefit benefit;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name="amount", nullable = false)
    private Double amount;
}
