package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.UserProfileDto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.MapsId;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import java.util.UUID;

@Entity
@Table(schema = "l4l_security", name = "user_profile")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfile {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "address")
    private String address;

    @Column(name = "telephone")
    private String telephone;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    public static UserProfile userProfileDtoToEntity(UserProfileDto userProfileDto) {
        return UserProfile.builder()
                .address(userProfileDto.address())
                .telephone(userProfileDto.telephone())
                .build();
    }
}