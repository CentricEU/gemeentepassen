package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(schema = "l4l_global", name = "offer_type")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferType implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "offerTypeId")
    private Integer offerTypeId;

    @Column(name = "offer_type_label")
    private String offerTypeLabel;

    @Column(name = "is_enabled")
    private boolean isEnabled;

}