package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Getter
@Setter
@Table(schema = "l4l_security", name = "recover_password")
public class RecoverPassword {

    @Id
    @GeneratedValue
    @Column(name = "recover_password_id", insertable = false, updatable = false)
    private Integer recoverPasswordId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "token")
    private String token;

    @Column(name = "token_expiration_date")
    private Date tokenExpirationDate;

    @Column(name = "is_active")
    private Boolean isActive;

    public static RecoverPassword of(UUID userId) {
        Date dateNow = new Date();
        Date tokenExpirationDate = new Date(dateNow.getTime() + TimeUnit.HOURS.toMillis(2)); // Add 2 hours
        String token = UUID.randomUUID().toString().replace("-", "");

        return RecoverPassword.builder()
                .token(token)
                .userId(userId)
                .tokenExpirationDate(tokenExpirationDate)
                .isActive(true)
                .build();
    }
}