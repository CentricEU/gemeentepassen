package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.InviteSupplier;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record InvitationDto(
        UUID id,
        LocalDateTime createdDate,
        String email,
        String message
) {

    public static InvitationDto invitationEntityToDto(InviteSupplier invitation) {
        return InvitationDto.builder()
                .id(invitation.getId())
                .email(invitation.getEmail())
                .createdDate(invitation.getCreatedDate())
                .message(invitation.getMessage())
                .build();
    }
}
