package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CategoryDto;
import nl.centric.innovation.local4local.dto.GroupDto;
import nl.centric.innovation.local4local.dto.LegalFormDto;
import nl.centric.innovation.local4local.dto.ProfileDropdownsViewDto;
import nl.centric.innovation.local4local.repository.CategoryRepository;
import nl.centric.innovation.local4local.repository.GroupRepository;
import nl.centric.innovation.local4local.repository.LegalFormRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileDropdownsService {


    private final CategoryRepository categoryRepository;

    private final LegalFormRepository legalFormRepository;

    private final GroupRepository groupRepository;

    public ProfileDropdownsViewDto getAllProfileDropdownsData() {
        return new ProfileDropdownsViewDto(getAllSubcategories(), getAllFormGroupLabels(), getAllGroupLabels());
    }

    public List<CategoryDto> getAllSubcategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDto::new)
                .toList();
    }

    public List<GroupDto> getAllGroupLabels() {
        return groupRepository.findAll()
                .stream()
                .map(group -> new GroupDto(group.getId(), group.getGroupLabel()))
                .toList();
    }

    public List<LegalFormDto> getAllFormGroupLabels() {
        return legalFormRepository.findAll()
                .stream()
                .map(legalForm -> new LegalFormDto(legalForm.getId(), legalForm.getLegalFormLabel()))
                .toList();
    }

}
