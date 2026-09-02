package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.javers.core.metamodel.annotation.DiffIgnore;

import java.io.Serializable;
import java.util.List;

/**
 * @DiffIgnore is used to ignore the subcategories field when comparing Category entities with JaVers,
 * as it can lead to performance issues (lazy issues) and is not relevant for most comparisons of Category entities.
 */

@Entity
@Table(schema = "l4l_global", name = "profile_dropdowns_categories")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor

@NamedEntityGraph(name = "include-subcategories",
        attributeNodes = @NamedAttributeNode("subcategories"))

public class Category implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "category_label")
    private String categoryLabel;

    @OneToMany
    @DiffIgnore
    @JoinTable(
            schema = "l4l_global", name = "profile_dropdowns_subcategories",
            joinColumns = @JoinColumn(name = "category_id"),
            inverseJoinColumns = @JoinColumn(name = "id"))
    private List<Subcategory> subcategories;
}
