package nl.centric.innovation.local4local.repository.impl;

import jakarta.persistence.EntityGraph;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import nl.centric.innovation.local4local.dto.FilterOfferRequestDto;
import nl.centric.innovation.local4local.entity.Offer;
import nl.centric.innovation.local4local.enums.OfferAttributeEnum;
import nl.centric.innovation.local4local.repository.OfferRepositoryFilterCustom;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class OfferRepositoryFilterCustomImpl implements OfferRepositoryFilterCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Offer> findAllWithSpecification(UUID supplierId, FilterOfferRequestDto filterParams, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Offer> query = cb.createQuery(Offer.class);
        Root<Offer> root = query.from(Offer.class);
        Specification<Offer> spec = this.buildSpecification(supplierId, filterParams);

        Predicate predicate = spec.toPredicate(root, query, cb);
        query.where(predicate);

        EntityGraph<Offer> entityGraph = entityManager.createEntityGraph(Offer.class);
        entityGraph.addAttributeNodes(
                OfferAttributeEnum.BENEFIT.getAttributeName(),
                OfferAttributeEnum.SUPPLIER.getAttributeName());

        TypedQuery<Offer> typedQuery = entityManager.createQuery(query)
                .setHint("jakarta.persistence.loadgraph", entityGraph)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize());

        return typedQuery.getResultList();
    }

    @Override
    public Integer countWithSpecification(UUID supplierId, FilterOfferRequestDto filterParams) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<Offer> root = query.from(Offer.class);
        Specification<Offer> spec = this.buildSpecification(supplierId, filterParams);

        Predicate predicate = spec.toPredicate(root, query, cb);
        query.where(predicate);
        query.select(cb.count(root));

        Long count = entityManager.createQuery(query).getSingleResult();
        return count.intValue();
    }

    private Specification<Offer> buildSpecification(UUID supplierId, FilterOfferRequestDto filterParams) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            addEqualPredicate(filterParams.status(),
                    root.get(OfferAttributeEnum.STATUS.getAttributeName()), predicates, criteriaBuilder);

            Optional.ofNullable(filterParams.offerTypeId())
                    .map(typeId -> criteriaBuilder.equal(
                            root.get(OfferAttributeEnum.OFFER_TYPE.getAttributeName())
                                    .get(OfferAttributeEnum.OFFER_TYPE_ID.getAttributeName()), typeId.toString()))
                    .ifPresent(predicates::add);


            Optional.ofNullable(filterParams.benefitId())
                    .map(benefitId -> criteriaBuilder.equal(
                            root.get(OfferAttributeEnum.BENEFIT.getAttributeName())
                                    .get(OfferAttributeEnum.ID.getAttributeName()), benefitId))
                    .ifPresent(predicates::add);

            predicates.add(criteriaBuilder.equal(
                    root.get(OfferAttributeEnum.SUPPLIER.getAttributeName())
                            .get(OfferAttributeEnum.ID.getAttributeName()), supplierId));
            predicates.add(criteriaBuilder.isTrue(root.get(OfferAttributeEnum.IS_ACTIVE.getAttributeName())));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void addEqualPredicate(Object value, Path<?> attribute, List<Predicate> predicates, CriteriaBuilder criteriaBuilder) {
        Optional.ofNullable(value)
                .ifPresent(val -> predicates.add(criteriaBuilder.equal(attribute, val)));
    }
}
