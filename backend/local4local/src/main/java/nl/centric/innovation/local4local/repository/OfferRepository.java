package nl.centric.innovation.local4local.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import nl.centric.innovation.local4local.dto.OfferMobileListDto;
import nl.centric.innovation.local4local.dto.OfferMobileMapLightDto;
import nl.centric.innovation.local4local.dto.OfferStatusCountsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID>, OfferRepositoryFilterCustom {

    String FIND_ALL_OFFERS_ORDERED_BY_DISTANCE_TO_USER = """
            SELECT new nl.centric.innovation.local4local.dto.OfferMobileListDto(offer,
            ST_Distance(Geography(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326)), offer.coordinates) * 1.0 AS distance,
            CASE WHEN offer.startDate <= :currentDay THEN true ELSE false END AS isActive)
            FROM Offer offer JOIN offer.supplier supplier where supplier.tenant.id = :tenantId AND offer.status = 'ACTIVE'
            AND offer.isActive = true  order by ST_Distance(Geography(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326)),offer.coordinates) asc
            """;
    String GET_OFFER_DISTANCE = """
            SELECT (ST_Distance(Geography(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326)), offer.coordinates) * 1.0) FROM Offer offer WHERE offer.id = :id
            """;

    String FIND_ACTIVE_OFFERS_IN_VIEWPORT = """
            SELECT new nl.centric.innovation.local4local.dto.OfferMobileMapLightDto(
            o,
            CASE WHEN o.startDate <= :currentDay THEN true ELSE false END AS isActive
            ) FROM Offer o JOIN o.supplier supplier
            WHERE o.isActive = true AND o.status='ACTIVE' AND supplier.tenant.id = :tenantId
            AND ST_Within(o.coordinates, ST_MakeEnvelope(:minLongitude, :minLatitude, :maxLongitude, :maxLatitude, 4326)) = true
            AND (:offerType = 0 OR o.offerType.id = :offerType)
            """;
    String COUNT_OFFERS_BY_STATUS_QUERY = """
            SELECT new nl.centric.innovation.local4local.dto.OfferStatusCountsDto(
                            COUNT(CASE WHEN o.status = 'ACTIVE' THEN 1 END),
                            COUNT(CASE WHEN o.status = 'EXPIRED' THEN 1 END),
                            COUNT(CASE WHEN o.status = 'PENDING' THEN 1 END))
                        FROM Offer o
                        WHERE o.supplier.id = :supplierId
                        AND o.createdDate >= :createdDate    
                        AND o.isActive = true  
            """;

    @Query(FIND_ALL_OFFERS_ORDERED_BY_DISTANCE_TO_USER)
    List<OfferMobileListDto> findAllOffersOrderedByDistanceToUser(Pageable pageable, @Param("latitude") Double latitude,
                                                                  @Param("longitude") Double longitude, @Param("tenantId") UUID tenantId,
                                                                  @Param("currentDay") LocalDate currentDay);

    @Query(FIND_ACTIVE_OFFERS_IN_VIEWPORT)
    List<OfferMobileMapLightDto> findActiveOffersInViewport(@Param("minLatitude") Double minLatitude,
                                                            @Param("maxLatitude") Double maxLatitude,
                                                            @Param("minLongitude") Double minLongitude,
                                                            @Param("maxLongitude") Double maxLongitude,
                                                            @Param("currentDay") LocalDate currentDay,
                                                            @Param("tenantId") UUID tenantId,
                                                            @Param("offerType") Integer offerType);

    @Query(GET_OFFER_DISTANCE)
    Double getOfferDistance(UUID id, @Param("latitude") Double latitude,
                            @Param("longitude") Double longitude);

    @EntityGraph(value = "include-grants-supplier-restriction-profile-graph", type = EntityGraph.EntityGraphType.LOAD)
    Optional<Offer> findById(UUID id);

    @EntityGraph(value = "include-grants-supplier-restriction-profile-graph", type = EntityGraph.EntityGraphType.LOAD)
    Optional<Offer> findByIdAndStatus(UUID id, GenericStatusEnum status);

    @EntityGraph(value = "include-grants-supplier-graph", type = EntityGraph.EntityGraphType.LOAD)
    Page<Offer> findAllBySupplierIdAndIsActive(UUID supplierId, boolean isActive, Pageable pageable);

    @EntityGraph(value = "include-grants-supplier-graph", type = EntityGraph.EntityGraphType.LOAD)
    Page<Offer> findAllBySupplierTenantIdAndIsActiveTrueAndStatusIn(UUID tenantId, Pageable pageable, List<GenericStatusEnum> statuses);

    Integer countBySupplierTenantIdAndIsActiveTrueAndStatusIn(UUID tenantId, List<GenericStatusEnum> statuses);

    Integer countBySupplierIdAndIsActiveTrue(UUID supplierId);

    @Query(COUNT_OFFERS_BY_STATUS_QUERY)
    OfferStatusCountsDto countOffersByStatusForSupplier(@Param("supplierId") UUID supplierId, @Param("createdDate") LocalDateTime createdDate);

}
