package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.DeletedUser;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface DeletedUserRepository extends CrudRepository<DeletedUser, UUID> {

}
