package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_global", name = "discount_code")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCode extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "code", nullable = false, unique = true)
    private String code;


    public static DiscountCode of(Offer offer, UUID userId, String code, Boolean isActive) {
        return DiscountCode.builder()
                .offer(offer)
                .userId(userId)
                .code(code)
                .isActive(isActive)
                .build();
    }

}
