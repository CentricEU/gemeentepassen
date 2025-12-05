package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.enums.AccountDeletionReason;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

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
    @Type(type = "pgsql_enum")
    private AccountDeletionReason reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

}
