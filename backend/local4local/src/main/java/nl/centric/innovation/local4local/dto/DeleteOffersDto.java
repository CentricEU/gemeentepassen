package nl.centric.innovation.local4local.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record DeleteOffersDto(List<UUID> offersIds) {}
