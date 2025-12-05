package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.RejectOfferDto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Table;
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
