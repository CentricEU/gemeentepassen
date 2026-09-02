package nl.centric.innovation.local4local.repository.impl;

import jakarta.persistence.StoredProcedureQuery;
import nl.centric.innovation.local4local.repository.GenericRepository;
import nl.centric.innovation.local4local.repository.RecoverPasswordRepositoryCustom;
import org.springframework.stereotype.Repository;


@Repository
public class RecoverPasswordRepositoryCustomImpl extends GenericRepository implements RecoverPasswordRepositoryCustom {


    @Override
    public void removeOldEntries() {
        StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("l4l_security.remove_old_password_recovery");
        query.execute();
    }

}