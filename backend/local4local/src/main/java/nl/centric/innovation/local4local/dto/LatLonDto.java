package nl.centric.innovation.local4local.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LatLonDto {
    @NonNull double latitude;
    @NonNull double longitude;

    public String toString() {
        return "{\"longitude\":" + longitude + ", \"latitude\":" + latitude + "}";
    }
}
