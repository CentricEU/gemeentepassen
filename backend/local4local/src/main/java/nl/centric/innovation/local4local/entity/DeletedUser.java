package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.enums.AccountDeletionReason;
import org.hibernate.annotations.Type;


@Entity
@Table(schema = "l4l_security", name = "deleted_users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeletedUser extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "reason")
    private AccountDeletionReason reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

}
