package nl.centric.innovation.local4local.service.impl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.validation.Valid;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.repository.CitizenGroupRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import org.apache.commons.lang3.StringUtils;
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
import nl.centric.innovation.local4local.util.CsvUtil;
import nl.centric.innovation.local4local.util.LocalDateParser;

import static nl.centric.innovation.local4local.dto.PassholderViewDto.entityToPassholderViewDto;

@Service
@RequiredArgsConstructor
public class PassholderService {

    private final TenantRepository tenantRepository;

    private final PrincipalService principalService;

    private final PassholderRepository passholderRepository;

    private final CitizenGroupRepository citizenGroupRepository;

    private final LocalDateParser dateParser;

    private final CitizenBenefitService citizenBenefitService;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.csv.manipulation}")
    private String errorCsvManipulation;

    @Value("${error.csv.date.format}")
    private String invalidDateFormat;

    @Value("${error.passholder.unique}")
    private String errorPassholderUnique;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${error.passholder.required}")
    private String errorPassholderRequiredFields;

    public static final String ORDER_CRITERIA = "name";

    @Transactional
    public List<Passholder> saveFromCSVFile(MultipartFile file, UUID citizenGroupId)
            throws CsvManipulationException, DtoValidateException {
        Tenant tenant = getTenant();

        CitizenGroup citizenGroup = citizenGroupRepository.findById(citizenGroupId)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        if(!citizenGroup.getTenantId().equals(tenant.getId())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        List<CSVRecord> csvRecords;

        try {
            csvRecords = getCsvRecords(file);
        } catch (IOException e) {
            throw new CsvManipulationException(errorCsvManipulation);
        }

        List<Passholder> passholderList = parseCsvFile(csvRecords, tenant, citizenGroup);

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
        Page<Passholder> passholders = passholderRepository.findAllByTenantIdOrderByCreatedDateDesc(tenantId, pageable);
        return passholders.stream().map(PassholderViewDto::entityToPassholderViewDto).collect(Collectors.toList());
    }

    public Integer countAll() {
        UUID tenantId = principalService.getTenantId();
        return passholderRepository.countByTenantId(tenantId);
    }

    //TODO Refactor this method both BE and FE
    public PassholderViewDto updatePassholder(@Valid PassholderViewDto passholderDto) throws DtoValidateException {
        Tenant tenant = getTenant();
        Passholder passholder = passholderRepository.findById(passholderDto.id())
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        Passholder passholderToSave = Passholder.passholderViewDtoToEntity(passholderDto, tenant);
        passholderToSave.setId(passholderDto.id());
        passholderToSave.setUser(passholder.getUser());

        return entityToPassholderViewDto(passholderRepository.save(passholderToSave));
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
        citizenBenefitService.createCitizenBenefitForUserIdAndBenefits(user.getId(), passholder.getCitizenGroup().getBenefits());

    }

    private List<Passholder> parseCsvFile(List<CSVRecord> csvRecords, Tenant tenant, CitizenGroup citizenGroup) throws DtoValidateException {
        List<Passholder> passholderList = new ArrayList<Passholder>();
        for (CSVRecord record : csvRecords) {
            Passholder passholder = CsvUtil.parsePassholderFromRecord(record);

            if (isPassholderInvalid(passholder)) {
                throw new DtoValidateException(errorPassholderRequiredFields);
            }

            String expiringDate = record.get(PassholderColumnsEnum.EXPIRING_DATE.getCsvColumn());
            Optional<LocalDate> localDate = dateParser.parseDateString(expiringDate);
            if (localDate.isEmpty()) {
                throw new DtoValidateException(invalidDateFormat);
            }

            passholder.setExpiringDate(localDate.get());
            passholder.setTenant(tenant);
            passholder.setCitizenGroup(citizenGroup);
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
        Optional<Tenant> tenant = tenantRepository.findById(tenantUUID);

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        return tenant.get();
    }

    private UUID getTenantId() {
        return principalService.getTenantId();
    }

    private boolean isPassholderInvalid(Passholder passholder) {
        return StringUtils.isBlank(passholder.getAddress()) ||
                StringUtils.isBlank(passholder.getName()) ||
                StringUtils.isBlank(passholder.getBsn()) ||
                StringUtils.isBlank(passholder.getPassNumber()) ||
                StringUtils.isBlank(passholder.getResidenceCity());
    }

}
