package nl.centric.innovation.local4local.repository;

import java.util.List;
import java.util.UUID;

import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.repository.CrudRepository;

import nl.centric.innovation.local4local.entity.WorkingHours;

@JaversSpringDataAuditable
public interface WorkingHoursRepository extends CrudRepository<WorkingHours, UUID> {

    List<WorkingHours> findAllBySupplierIdOrderByDayAsc(UUID supplierId);
    List<WorkingHours> findAllByIdInAndSupplierId(List<UUID> ids, UUID supplierId);

}
