package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.BankHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BankHolidayRepository extends JpaRepository<BankHoliday, UUID> {
    Integer countByYear(Integer year);
    List<BankHoliday> getAllByYear(Integer year);
}
