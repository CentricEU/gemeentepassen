package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    @EntityGraph("include-subcategories")
    List<Category> findAll();
}
