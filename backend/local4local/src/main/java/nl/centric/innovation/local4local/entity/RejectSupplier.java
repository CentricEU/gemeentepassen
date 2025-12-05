package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.enums.RejectionReason;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import java.util.UUID;

@EqualsAndHashCode
@Entity
@Table(schema = "l4l_global", name = "supplier_rejection")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectSupplier {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "reason")
    @Type(type = "pgsql_enum")
    private RejectionReason reason;

    @Column(name = "comments")
    private String comments;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
}
