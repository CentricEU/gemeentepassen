package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "l4l_global", name = "citizen_group_assignment")
public class CitizenGroupAssignment extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "citizen_group_id", nullable = false)
    private CitizenGroup citizenGroup;

    @Column(name = "citizen_id", nullable = false, unique = true)
    private UUID citizenId;

    public static CitizenGroupAssignment from(CitizenGroup citizenGroup, UUID citizenId) {
        return CitizenGroupAssignment.builder()
                .citizenGroup(citizenGroup)
                .citizenId(citizenId)
                .build();
    }
}
