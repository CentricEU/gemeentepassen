package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.UserProfileDto;

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