package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(schema = "l4l_global", name = "invite_supplier")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InviteSupplier extends BaseEntity {

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "email")
    private String email;

    @Column(name = "message")
    private String message;

    @Column(name = "is_active")
    private boolean isActive;

    public static InviteSupplier createInviteSupplierToEntity(UUID tenantId, String email, String message) {
        return InviteSupplier.builder()
                .tenantId(tenantId)
                .email(email)
                .message(message)
                .build();
    }


}
