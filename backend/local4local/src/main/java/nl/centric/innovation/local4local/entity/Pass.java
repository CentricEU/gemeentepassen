package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.PassDto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "l4l_global", name = "passes")
public class Pass extends BaseEntity {
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "first_name", length = 128, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 128, nullable = false)
    private String lastName;

    @Column(name = "birthday", nullable = false)
    private LocalDate birthday;

    @Column(name = "bsn", length = 32, nullable = false)
    private String bsn;

    @Column(name = "contact_phone", length = 12, nullable = false)
    private String contactPhone;

    @Column(name = "contact_email", length = 256, nullable = false)
    private String contactEmail;

    @Column(name = "additional_info", length = 1024)
    private String additionalInfo;

    public static Pass fromDto(PassDto dto) {
        return Pass.builder()
                .firstName(dto.firstName())
                .lastName(dto.lastName())
                .birthday(dto.birthday())
                .bsn(dto.bsn())
                .contactPhone(dto.contactPhone())
                .contactEmail(dto.contactEmail())
                .additionalInfo(dto.additionalInfo())
                .build();
    }
}
