package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Category;

import java.util.List;
import java.util.stream.Collectors;

@Builder
public record CategoryDto(Integer id, String categoryLabel, List<SubcategoryDto> subcategoryLabels) {
    public CategoryDto(Category category) {
        this(
                category.getId(),
                category.getCategoryLabel(),
                category.getSubcategories().stream()
                        .map(subcategory -> new SubcategoryDto(
                                subcategory.getId(),
                                subcategory.getSubcategoryLabel()))
                        .collect(Collectors.toList())
        );
    }
}

