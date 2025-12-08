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
    String BENEFIT_ACCESS_FOR_OFFER = """
                AND EXISTS (
                    SELECT 1
                    FROM Benefit b
                    JOIN b.citizenGroups cg
                    JOIN Passholder ph ON ph.citizenGroup.id = cg.id
                    WHERE b = o.benefit
                    AND ph.user.id = :userId
                )
            """;

    String FIND_ALL_OFFERS_ORDERED_BY_DISTANCE_TO_USER = """
            SELECT new nl.centric.innovation.local4local.dto.OfferMobileListDto(o,
            ST_Distance(Geography(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326)), o.coordinates) * 1.0 AS distance,
            CASE WHEN o.startDate <= :currentDay THEN true ELSE false END AS isActive)
            FROM Offer o JOIN o.supplier supplier where supplier.tenant.id = :tenantId AND o.status = 'ACTIVE'
            AND o.isActive = true
            """ + BENEFIT_ACCESS_FOR_OFFER + """
            AND (:offerType = -1 OR o.offerType.id = :offerType)
            order by ST_Distance(Geography(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326)),o.coordinates) asc
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
            AND (:offerType = -1 OR o.offerType.id = :offerType)
            """ + BENEFIT_ACCESS_FOR_OFFER;
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

    String FIND_OFFERS_TITLE_BY_KEYWORD = """
            SELECT o.title
            FROM Offer o
            WHERE (
                LOWER(o.title) LIKE LOWER(CONCAT(:keyword, '%')) 
                OR LOWER(o.title) LIKE LOWER(CONCAT('% ', :keyword, '%'))
            )
            AND o.supplier.tenant.id = :tenantId 
            AND o.status = :status 
            AND o.isActive = true 
            """ + BENEFIT_ACCESS_FOR_OFFER;


    String FIND_SEARCHED_OFFERS_ORDERED_BY_DISTANCE_TO_USER = """
            SELECT new nl.centric.innovation.local4local.dto.OfferMobileListDto(o,
            ST_Distance(Geography(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326)), o.coordinates) * 1.0 AS distance,
            CASE WHEN o.startDate <= :currentDay THEN true ELSE false END AS isActive)
            FROM Offer o JOIN o.supplier supplier WHERE (
                LOWER(o.title) LIKE LOWER(CONCAT(:keyword, '%'))
                OR LOWER(o.title) LIKE LOWER(CONCAT('% ', :keyword, '%'))
            ) AND
            supplier.tenant.id = :tenantId AND o.status = 'ACTIVE'
            AND o.isActive = true
            """ + BENEFIT_ACCESS_FOR_OFFER + """
            AND (:offerType = -1 OR o.offerType.id = :offerType)
            order by ST_Distance(Geography(ST_SetSRID(ST_MakePoint(:longitude,:latitude),4326)),o.coordinates) asc
            """;

    String FIND_ACTIVE_SEARCHED_OFFERS_IN_VIEWPORT = """
            SELECT new nl.centric.innovation.local4local.dto.OfferMobileMapLightDto(
            o,
            CASE WHEN o.startDate <= :currentDay THEN true ELSE false END AS isActive
            ) FROM Offer o JOIN o.supplier supplier
            WHERE (
                LOWER(o.title) LIKE LOWER(CONCAT(:keyword, '%')) 
                OR LOWER(o.title) LIKE LOWER(CONCAT('% ', :keyword, '%'))
            ) AND o.isActive = true AND o.status='ACTIVE' AND supplier.tenant.id = :tenantId
            AND ST_Within(o.coordinates, ST_MakeEnvelope(:minLongitude, :minLatitude, :maxLongitude, :maxLatitude, 4326)) = true
            AND (:offerType = -1 OR o.offerType.id = :offerType)
            """ + BENEFIT_ACCESS_FOR_OFFER;

    String FIND_BY_ID_AND_STATUS_WITH_BENEFIT_ACCESS = """
                SELECT o FROM Offer o
                WHERE o.id = :id
                  AND o.status = :status
            """ + BENEFIT_ACCESS_FOR_OFFER;

    @Query(FIND_ALL_OFFERS_ORDERED_BY_DISTANCE_TO_USER)
    List<OfferMobileListDto> findAllOffersOrderedByDistanceToUser(Pageable pageable,
                                                                  @Param("latitude") Double latitude,
                                                                  @Param("longitude") Double longitude,
                                                                  @Param("tenantId") UUID tenantId,
                                                                  @Param("currentDay") LocalDate currentDay,
                                                                  @Param("userId") UUID userId,
                                                                  @Param("offerType") Integer offerType);

    @Query(FIND_SEARCHED_OFFERS_ORDERED_BY_DISTANCE_TO_USER)
    List<OfferMobileListDto> findSearchedOffersOrderedByDistanceToUser(Pageable pageable,
                                                                       @Param("latitude") Double latitude,
                                                                       @Param("longitude") Double longitude,
                                                                       @Param("tenantId") UUID tenantId,
                                                                       @Param("currentDay") LocalDate currentDay,
                                                                       @Param("userId") UUID userId,
                                                                       @Param("keyword") String searchKeyword,
                                                                       @Param("offerType") Integer offerType);

    @Query(FIND_ACTIVE_OFFERS_IN_VIEWPORT)
    List<OfferMobileMapLightDto> findActiveOffersInViewport(@Param("minLatitude") Double minLatitude,
                                                            @Param("maxLatitude") Double maxLatitude,
                                                            @Param("minLongitude") Double minLongitude,
                                                            @Param("maxLongitude") Double maxLongitude,
                                                            @Param("currentDay") LocalDate currentDay,
                                                            @Param("tenantId") UUID tenantId,
                                                            @Param("offerType") Integer offerType,
                                                            @Param("userId") UUID userId);

    @Query(GET_OFFER_DISTANCE)
    Double getOfferDistance(UUID id, @Param("latitude") Double latitude,
                            @Param("longitude") Double longitude);

    @EntityGraph(value = "include-supplier-restriction-profile-graph", type = EntityGraph.EntityGraphType.LOAD)
    Optional<Offer> findById(UUID id);

    @Query(FIND_BY_ID_AND_STATUS_WITH_BENEFIT_ACCESS)
    @EntityGraph(value = "include-supplier-restriction-profile-graph", type = EntityGraph.EntityGraphType.LOAD)
    Optional<Offer> findByIdAndStatusWithBenefitAccess(@Param("id") UUID id,
                                                     @Param("status") GenericStatusEnum status,
                                                     @Param("userId") UUID userId);

    @EntityGraph(value = "include-supplier-graph", type = EntityGraph.EntityGraphType.LOAD)
    Page<Offer> findAllBySupplierIdAndIsActive(UUID supplierId, boolean isActive, Pageable pageable);

    @EntityGraph(value = "include-supplier-graph", type = EntityGraph.EntityGraphType.LOAD)
    Page<Offer> findAllBySupplierTenantIdAndIsActiveTrueAndStatusIn(UUID tenantId, Pageable pageable, List<GenericStatusEnum> statuses);

    Integer countBySupplierTenantIdAndIsActiveTrueAndStatusIn(UUID tenantId, List<GenericStatusEnum> statuses);

    Integer countBySupplierIdAndIsActiveTrue(UUID supplierId);

    @Query(COUNT_OFFERS_BY_STATUS_QUERY)
    OfferStatusCountsDto countOffersByStatusForSupplier(@Param("supplierId") UUID supplierId, @Param("createdDate") LocalDateTime createdDate);

    @Query(FIND_OFFERS_TITLE_BY_KEYWORD)
    List<String> searchByTitlePrefix(
            @Param("keyword") String keyword,
            @Param("tenantId") UUID tenantId,
            @Param("status") GenericStatusEnum status,
            @Param("userId") UUID userId);

    @Query(FIND_ACTIVE_SEARCHED_OFFERS_IN_VIEWPORT)
    List<OfferMobileMapLightDto> findActiveSearchOffersInViewport(@Param("minLatitude") Double minLatitude,
                                                                  @Param("maxLatitude") Double maxLatitude,
                                                                  @Param("minLongitude") Double minLongitude,
                                                                  @Param("maxLongitude") Double maxLongitude,
                                                                  @Param("currentDay") LocalDate currentDay,
                                                                  @Param("tenantId") UUID tenantId,
                                                                  @Param("offerType") Integer offerType,
                                                                  @Param("userId") UUID userId,
                                                                  @Param("keyword") String searchKeyword);
}
