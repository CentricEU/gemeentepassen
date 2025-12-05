package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.entity.Offer;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface OfferRepositoryFilterCustom {
    List<Offer> findAllWithSpecification(UUID supplierId, FilterOfferRequestDto filterParams, Pageable pageable);
    Integer countWithSpecification(UUID supplierId, FilterOfferRequestDto filterParams);
}

