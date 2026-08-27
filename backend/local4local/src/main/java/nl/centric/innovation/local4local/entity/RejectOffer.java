package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.RejectOfferDto;

import java.util.UUID;

@Entity
@Table(schema = "l4l_global", name = "offer_rejection")
@Builder
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class RejectOffer {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "reason", nullable = false)
    private String reason;

    @JoinColumn(name = "offer_id", nullable = false)
    private UUID offerId;

    public static RejectOffer rejectOfferDtoToEntity(RejectOfferDto rejectOfferDto) {
        return RejectOffer.builder()
                .reason(rejectOfferDto.reason())
                .offerId(rejectOfferDto.offerId())
                .build();
    }
}
