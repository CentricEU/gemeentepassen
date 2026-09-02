package nl.centric.innovation.local4local.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;

import lombok.Getter;
import lombok.Setter;

/**
 * @org.javers.core.metamodel.annotation.Id - used to indicate that the id field is the unique identifier for JaVers when comparing entities.
 * This allows JaVers to track changes to entities based on their id, which is essential for accurate change tracking and versioning in the application.
 */

@Setter
@Getter
@MappedSuperclass
public abstract class BaseEntity implements Serializable {

	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    @org.javers.core.metamodel.annotation.Id
    private UUID id;

    @Generated(GenerationTime.INSERT)
    @Column(name="created_date", updatable=false)
    private LocalDateTime createdDate;
}