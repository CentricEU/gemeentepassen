package nl.centric.innovation.local4local.repository;

import java.util.UUID;

import nl.centric.innovation.local4local.entity.Passholder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PassholderRepositoryCustom {

    Page<Passholder> findAllByFilterCriteria(UUID tenantId, String bsn, String passNumber, Pageable pageable);
    Integer countAllByFilterCriteria(UUID tenantId, String bsn, String passNumber);
}