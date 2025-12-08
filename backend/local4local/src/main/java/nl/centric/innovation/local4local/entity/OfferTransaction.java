package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Column;
import java.io.Serial;
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
public class OfferTransaction {

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
    private Double amount;

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
