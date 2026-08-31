package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@EqualsAndHashCode()
@Entity
@Table(schema = "l4l_global", name = "offer_transaction")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfferTransaction implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name="created_date", updatable=false)
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "discount_code_id")
    private DiscountCode discountCode;

    @Column(name = "amount")
    private BigDecimal amount;

    public static OfferTransaction offerTransactionDtoToEntity(DiscountCode discountCode, LocalDateTime createdDate) {
        OfferTransaction offerTransaction = new OfferTransaction();
        offerTransaction.setDiscountCode(discountCode);
        offerTransaction.setCreatedDate(createdDate);

        return offerTransaction;
    }

    public String getOfferBenefitName() {
        return discountCode.getOffer().getBenefit().getName();
    }
}
