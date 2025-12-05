package nl.centric.innovation.local4local.service.impl;

import java.util.UUID;

import nl.centric.innovation.local4local.entity.Tenant;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import nl.centric.innovation.local4local.entity.User;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Service
public class PrincipalService {

    @PersistenceContext
    private EntityManager entityManager;

    public UUID getTenantId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getTenantId();
    }

    public Tenant getTenant() {
        return getUser().getSupplier().getTenant();
    }

    public User getUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public UUID getSupplierId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getSupplier().getId();
    }

    public String getUserFullName() {
        User user = getUser();
        return String.format("%s %s", user.getFirstName(), user.getLastName());
    }

}
