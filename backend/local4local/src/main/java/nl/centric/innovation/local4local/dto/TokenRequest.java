package nl.centric.innovation.local4local.dto;

import javax.validation.constraints.NotEmpty;

public record TokenRequest(
        @NotEmpty(message = "tokenId is required") String tokenId,
        @NotEmpty(message = "access token is required") String accessToken){
}
