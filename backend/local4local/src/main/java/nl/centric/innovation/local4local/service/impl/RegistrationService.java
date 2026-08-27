package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;
import nl.centric.innovation.local4local.entity.CitizenGroup;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.PassholderColumnsEnum;
import nl.centric.innovation.local4local.exceptions.CsvManipulationException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.CitizenGroupRepository;
import nl.centric.innovation.local4local.repository.PassholderRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.util.CsvUtil;
import nl.centric.innovation.local4local.util.LocalDateParser;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final TenantRepository tenantRepository;

    private final PrincipalService principalService;

    private final PassholderRepository passholderRepository;

    private final CitizenGroupRepository citizenGroupRepository;

    private final UserService userService;

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

        if (!citizenGroup.getTenantId().equals(tenant.getId())) {
            throw new DtoValidateException(errorEntityValidate);
        }

        List<CSVRecord> csvRecords;

        try {
            csvRecords = getCsvRecords(file);
        } catch (IOException e) {
            throw new CsvManipulationException(errorCsvManipulation);
        }

        List<Passholder> passholderList = parseCsvFile(csvRecords, tenant, citizenGroup);

        List<Passholder> savedPassholders = passholderRepository.saveAll(passholderList);
        passholderRepository.flush();

        // Now build RegisterCitizenUserDtos from the saved passholders
        List<RegisterCitizenUserDto> registerCitizenUserDtoList = getRegisterCitizenUserDtoList(savedPassholders);

        try {
            userService.saveCitizens(registerCitizenUserDtoList, "nl-NL");
            return savedPassholders;
        } catch (RuntimeException e) {
            // If user creation fails, rollback everything
            throw new CsvManipulationException(errorEntityValidate);
        }

    }


    private List<RegisterCitizenUserDto> getRegisterCitizenUserDtoList(List<Passholder> passholderList) {
        List<RegisterCitizenUserDto> registerCitizenUserDtoList = new ArrayList<>();
        String randomString = "V9@k2!zQ+";

        for (Passholder passholder : passholderList) {

            RegisterCitizenUserDto registerDto = RegisterCitizenUserDto.builder()
                    .email(passholder.bsn)
                    .firstName(passholder.name)
                    .lastName(passholder.name)
                    .password(passholder.bsn + randomString)
                    .retypedPassword(passholder.bsn + randomString)
                    .passNumber(passholder.passNumber)
                    .build();

            registerCitizenUserDtoList.add(registerDto);
        }

        return registerCitizenUserDtoList;
    }

    private List<Passholder> parseCsvFile(List<CSVRecord> csvRecords, Tenant tenant, CitizenGroup citizenGroup) throws DtoValidateException {
        List<Passholder> passholderList = new ArrayList<Passholder>();
        List<RegisterCitizenUserDto> registerCitizenUserDto = new ArrayList<>();


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

    private boolean isPassholderInvalid(Passholder passholder) {
        return StringUtils.isBlank(passholder.getAddress()) ||
                StringUtils.isBlank(passholder.getName()) ||
                StringUtils.isBlank(passholder.getBsn()) ||
                StringUtils.isBlank(passholder.getPassNumber()) ||
                StringUtils.isBlank(passholder.getResidenceCity());
    }

}
