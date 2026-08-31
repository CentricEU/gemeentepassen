
package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@EqualsAndHashCode()
@Entity
@Table(schema = "l4l_global", name = "offer_search_history")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfferSearchHistory implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "search_keyword")
    private String searchKeyword;

    public static OfferSearchHistory createEntityOfferSearchHistory(User user, String searchKeyword) {
        return OfferSearchHistory.builder()
                .createdDate(LocalDateTime.now())
                .searchKeyword(searchKeyword)
                .user(user)
                .build();
    }
}
