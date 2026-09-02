package nl.centric.innovation.local4local.repository.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.repository.PassholderRepositoryCustom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

@Repository
public class PassholderRepositoryImpl implements PassholderRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Integer countAllByFilterCriteria(UUID tenantId, String bsn, String passNumber) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<Passholder> root = cq.from(Passholder.class);
        cq.select(cb.count(root));
        cq.where(buildPredicate(cb, root, tenantId, bsn, passNumber));
        return entityManager.createQuery(cq).getSingleResult().intValue();
    }

    @Override
    public Page<Passholder> findAllByFilterCriteria(UUID tenantId, String bsn, String passNumber, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Passholder> cq = cb.createQuery(Passholder.class);
        Root<Passholder> root = cq.from(Passholder.class);
        cq.where(buildPredicate(cb, root, tenantId, bsn, passNumber));
        cq.orderBy(buildOrders(cb, root, pageable.getSort()));

        TypedQuery<Passholder> query = entityManager.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        List<Passholder> content = query.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Passholder> countRoot = countQuery.from(Passholder.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(buildPredicate(cb, countRoot, tenantId, bsn, passNumber));

        long total = entityManager.createQuery(countQuery).getSingleResult();
        return new PageImpl<>(content, pageable, total);
    }

    private Expression<Boolean> buildPredicate(CriteriaBuilder cb, Root<Passholder> root, UUID tenantId, String bsn, String passNumber) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));

        if (bsn != null) {
            predicates.add(cb.like(cb.lower(root.get("bsn")), bsn.toLowerCase()));
        }
        if (passNumber != null) {
            predicates.add(cb.like(cb.lower(root.get("passNumber")), passNumber.toLowerCase()));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    }

    private List<Order> buildOrders(CriteriaBuilder cb, Root<Passholder> root, Sort sort) {
        List<Order> orders = new ArrayList<>();
        if (sort != null && sort.isSorted()) {
            for (Sort.Order order : sort) {
                orders.add(order.isAscending()
                        ? cb.asc(root.get(order.getProperty()))
                        : cb.desc(root.get(order.getProperty())));
            }
        } else {
            orders.add(cb.asc(root.get("name")));
        }
        return orders;
    }
}