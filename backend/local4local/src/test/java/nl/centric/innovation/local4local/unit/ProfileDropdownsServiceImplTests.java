package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.GroupDto;
import nl.centric.innovation.local4local.dto.LegalFormDto;
import nl.centric.innovation.local4local.dto.ProfileDropdownsViewDto;
import nl.centric.innovation.local4local.dto.CategoryDto;
import nl.centric.innovation.local4local.dto.SubcategoryDto;
import nl.centric.innovation.local4local.entity.Category;
import nl.centric.innovation.local4local.entity.Group;
import nl.centric.innovation.local4local.entity.LegalForm;
import nl.centric.innovation.local4local.entity.Subcategory;
import nl.centric.innovation.local4local.repository.CategoryRepository;
import nl.centric.innovation.local4local.repository.GroupRepository;
import nl.centric.innovation.local4local.repository.LegalFormRepository;
import nl.centric.innovation.local4local.service.impl.ProfileDropdownsServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProfileDropdownsServiceImplTests {

    @InjectMocks
    private ProfileDropdownsServiceImpl profileDropdownsService;
    @Mock
    private CategoryRepository profileDropdownCategoryRepository;
    @Mock
    private LegalFormRepository profileDropdownLegalFormRepository;
    @Mock
    private GroupRepository profileDropdownGroupRepository;

    @Test
    public void GivenValidRequest_WhenGetAllCategories_ThenExpectReturningExpectedResult() {
        // Given
        Category category = new Category();
        category.setCategoryLabel("TestCategory");

        Subcategory subcategory = new Subcategory();
        subcategory.setSubcategoryLabel("TestSubcategory");
        category.setSubcategories(Arrays.asList(subcategory));

        // When
        when(profileDropdownCategoryRepository.findAll()).thenReturn(Arrays.asList(category));

        List<CategoryDto> result = profileDropdownsService.getAllSubcategories();

        // Then
        assertEquals(1, result.size());
        assertEquals(
                new CategoryDto(1, "TestCategory",
                        Arrays.asList(new SubcategoryDto(1, "Subcategory1"))),
                new CategoryDto(1, result.get(0).categoryLabel(),
                        Arrays.asList(new SubcategoryDto(1, "Subcategory1")))
        );
    }

    @Test
    public void GivenValidRequest_WhenGetAllGroups_ThenExpectReturningExpectedResult() {
        // Given
        Group group = new Group();
        group.setGroupLabel("TestGroup");

        // When
        when(profileDropdownGroupRepository.findAll()).thenReturn(Arrays.asList(group));

        List<GroupDto> result = profileDropdownsService.getAllGroupLabels();

        // Then
        assertEquals(1, result.size());
        assertEquals(new GroupDto(1, "TestGroup"), new GroupDto(1, result.get(0).label()));
    }

    @Test
    public void GivenValidRequest_WhenGetAllLegalForms_ThenExpectReturningExpectedResult() {
        // Given
        LegalForm legalForm = new LegalForm();
        legalForm.setLegalFormLabel("TestLegalForm");

        // When
        when(profileDropdownLegalFormRepository.findAll()).thenReturn(Arrays.asList(legalForm));

        List<LegalFormDto> result = profileDropdownsService.getAllFormGroupLabels();

        // Then
        assertEquals(1, result.size());
        assertEquals(new LegalFormDto(1, "TestLegalForm"), new LegalFormDto(1, result.get(0).label()));
    }

    @Test
    public void GivenValidRequest_WhenGetAllDropdownData_ThenExpectReturningExpectedResult() {
        // Given
        Category category = new Category();
        category.setCategoryLabel("TestCategory");

        Subcategory subcategory = new Subcategory();
        subcategory.setSubcategoryLabel("TestSubcategory");
        category.setSubcategories(Arrays.asList(subcategory));

        Group group = new Group();
        group.setGroupLabel("TestGroup");

        LegalForm legalForm = new LegalForm();
        legalForm.setLegalFormLabel("TestLegalForm");

        // When
        when(profileDropdownCategoryRepository.findAll()).thenReturn(Arrays.asList(category));
        when(profileDropdownGroupRepository.findAll()).thenReturn(Arrays.asList(group));
        when(profileDropdownLegalFormRepository.findAll()).thenReturn(Arrays.asList(legalForm));

        ProfileDropdownsViewDto result = profileDropdownsService.getAllProfileDropdownsData();

        // Then
        assertEquals(1, result.categories().size());
        assertEquals(
                new CategoryDto(1, "TestCategory",
                        Arrays.asList(new SubcategoryDto(1, "Subcategory1"))),
                new CategoryDto(1, result.categories().get(0).categoryLabel(),
                        Arrays.asList(new SubcategoryDto(1, "Subcategory1")))
        );

        assertEquals(1, result.legalFormLabels().size());
        assertEquals(new LegalFormDto(2, "TestLegalForm"), new LegalFormDto(2, result.legalFormLabels().get(0).label()));

        assertEquals(1, result.groupLabels().size());
        assertEquals(new GroupDto(3, "TestGroup"), new GroupDto(3, result.groupLabels().get(0).label()));
    }

}
