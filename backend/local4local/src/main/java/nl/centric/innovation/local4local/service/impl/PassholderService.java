package nl.centric.innovation.local4local.service.impl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.validation.Valid;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.AssignPassholderGrantsDto;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.User;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import nl.centric.innovation.local4local.dto.PassholderViewDto;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.PassholderColumnsEnum;
import nl.centric.innovation.local4local.exceptions.CsvManipulationException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.CsvUtil;
import nl.centric.innovation.local4local.util.LocalDateParser;
import nl.centric.innovation.local4local.util.ModelConverter;

import static nl.centric.innovation.local4local.dto.PassholderViewDto.entityToPassholderViewDto;

@Service
@RequiredArgsConstructor
public class PassholderService {

    private final TenantService tenantService;

    private final GrantService grantService;

    private final PrincipalService principalService;

    private final PassholderRepository passholderRepository;

    private final LocalDateParser dateParser;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.csv.manipulation}")
    private String errorCsvManipulation;

    @Value("${error.csv.date.format}")
    private String invalidDateFormat;

    @Value("${error.passholder.unique}")
    private String errorPassholderUnique;

    public static final String ORDER_CRITERIA = "name";

    public List<Passholder> saveFromCSVFile(MultipartFile file) throws CsvManipulationException, DtoValidateException {
        Tenant tenant = getTenant();

        List<CSVRecord> csvRecords;

        try {
            csvRecords = getCsvRecords(file);
        } catch (IOException e) {
            throw new CsvManipulationException(errorCsvManipulation);
        }

        List<Passholder> passholderList = parseCsvFile(csvRecords, tenant);

        // this handles the case when the BSN or the Passnumber already exists in the database
        try {
            return passholderRepository.saveAll(passholderList);
        } catch (RuntimeException e) {
            throw new CsvManipulationException(errorPassholderUnique);
        }
    }

    public List<PassholderViewDto> getAll(Integer page, Integer size) {
        UUID tenantId = principalService.getTenantId();

        Pageable pageable = PageRequest.of(page, size, Sort.by(ORDER_CRITERIA));
        Page<Passholder> passholders = passholderRepository.findAllByTenantId(tenantId, pageable);
        return passholders.stream().map(PassholderViewDto::entityToPassholderViewDto).collect(Collectors.toList());
    }

    public Integer countAll() {
        UUID tenantId = principalService.getTenantId();
        return passholderRepository.countByTenantId(tenantId);
    }

    public PassholderViewDto updatePassholder(@Valid PassholderViewDto passholderDto) throws DtoValidateNotFoundException {
        Tenant tenant = getTenant();
        Passholder passholder = ModelConverter.passholderViewDtoToEntity(passholderDto, tenant);
        passholder.setId(passholderDto.id());
        return entityToPassholderViewDto(passholderRepository.save(passholder));
    }

    @Transactional
    public List<PassholderViewDto> assignPassholders(@Valid AssignPassholderGrantsDto assignPassholderGrantsDto) throws DtoValidateNotFoundException {

        Set<Grant> grantsToAssign = grantService.getAllInIds(assignPassholderGrantsDto.grantsIds());
        List<Passholder> passholders = passholderRepository.findAllById(assignPassholderGrantsDto.passholderIds());

        List<Passholder> passHoldersToSave = passholders.stream()
                .map(passholder -> {
                    List<Grant> allGrants = mergeGrantsToExistingOnes(passholder.getGrants(), grantsToAssign);
                    passholder.setGrants(allGrants);
                    return passholder;
                })
                .collect(Collectors.toList());

        List<Passholder> savedPassholders = passholderRepository.saveAll(passHoldersToSave);
        return savedPassholders.stream().map(PassholderViewDto::entityToPassholderViewDto).collect(Collectors.toList());
    }

    public void deletePassholder(UUID passholderId) throws DtoValidateNotFoundException {

        Optional<Passholder> passholder = passholderRepository.findById(passholderId);

        if (!passholder.isPresent()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        passholderRepository.deleteById(passholderId);
    }

    public Passholder getPassholderByPassNumber(String passNumber) throws DtoValidateNotFoundException {
        return passholderRepository.findByPassNumber(passNumber)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
    }

    public void saveUserForPassholder(Passholder passholder, User user) {
        passholder.setUser(user);
        passholderRepository.save(passholder);
    }

    private List<Passholder> parseCsvFile(List<CSVRecord> csvRecords, Tenant tenant) throws DtoValidateException {
        List<Passholder> passholderList = new ArrayList<Passholder>();
        for (CSVRecord record : csvRecords) {
            Passholder passholder = CsvUtil.parsePassholderFromRecord(record);
            String expiringDate = record.get(PassholderColumnsEnum.EXPIRING_DATE.getCsvColumn());
            Optional<LocalDate> localDate = dateParser.parseDateString(expiringDate);
            if (localDate.isEmpty()) {
                throw new DtoValidateException(invalidDateFormat);
            }
            passholder.setExpiringDate(localDate.get());
            passholder.setTenant(tenant);
            passholderList.add(passholder);
        }

        return passholderList;
    }

    private List<CSVRecord> getCsvRecords(MultipartFile file) throws IOException {
        try (BufferedReader fileReader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader,
                     CSVFormat.DEFAULT.withHeader().withIgnoreSurroundingSpaces())) {
            return csvParser.getRecords();
        }
    }

    private Tenant getTenant() throws DtoValidateNotFoundException {
        UUID tenantUUID = principalService.getTenantId();
        Optional<Tenant> tenant = tenantService.findByTenantId(tenantUUID);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        return tenant.get();
    }

    private List<Grant> mergeGrantsToExistingOnes(List<Grant> passholderExistingGrants, Set<Grant> assigningGrants) {
        Set<Grant> mergedGrants = new HashSet<>(assigningGrants);
        mergedGrants.addAll(passholderExistingGrants);

        return mergedGrants.stream().collect(Collectors.toList());
    }



}
