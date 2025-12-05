package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.List;

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
    @JoinTable(
            schema = "l4l_global", name = "profile_dropdowns_subcategories",
            joinColumns = @JoinColumn(name = "category_id"),
            inverseJoinColumns = @JoinColumn(name = "id"))
    private List<Subcategory> subcategories;
}
