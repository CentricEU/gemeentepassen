package nl.centric.innovation.local4local.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@MappedSuperclass
public abstract class BaseEntity implements Serializable {

	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;
	
	@GeneratedValue
	@Generated(GenerationTime.INSERT)
	@Column(name="created_date", updatable=false)
	private LocalDateTime createdDate;
}