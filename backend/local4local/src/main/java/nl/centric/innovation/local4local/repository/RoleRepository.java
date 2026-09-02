package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Role;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends CrudRepository<Role, Integer> {
	Optional<Role> findByName(String name);
    List<Role> findByNameIn(List<String> names);
}
