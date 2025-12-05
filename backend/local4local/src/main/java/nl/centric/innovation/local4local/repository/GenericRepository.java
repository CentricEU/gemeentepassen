package nl.centric.innovation.local4local.repository;

import org.springframework.data.domain.Pageable;

import javax.persistence.EntityGraph;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaQuery;
import java.util.List;

public class GenericRepository {
    @PersistenceContext
    protected EntityManager entityManager;

    protected <T> List<T> createTypedQueryForPaginatedList(CriteriaQuery<T> criteriaQuery, Pageable pageable) {
        TypedQuery<T> typedQuery = entityManager.createQuery(criteriaQuery);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        return typedQuery.getResultList();
    }

    protected <T> List<T> createTypedQueryWithMaxResultsList(CriteriaQuery<T> criteriaQuery, int maxResults) {
        TypedQuery<T> typedQuery = entityManager.createQuery(criteriaQuery);
        typedQuery.setMaxResults(maxResults);
        return typedQuery.getResultList();
    }

    protected <T> List<T> createTypedQueryEnitytGraphForPaginatedList(CriteriaQuery<T> criteriaQuery, Pageable pageable, EntityGraph<?> entityGraph) {
        TypedQuery<T> typedQuery = entityManager.createQuery(criteriaQuery);
        typedQuery.setHint("jakarta.persistence.loadgraph", entityGraph);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        return typedQuery.getResultList();
    }
}