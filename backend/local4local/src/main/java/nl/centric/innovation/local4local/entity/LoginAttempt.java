package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_security", name = "login_attempt")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttempt extends BaseEntity {
    @Column(name = "remote_addr")
    private String remoteAddress;

    @Column(name = "failed_count")
    private Integer count;

}
