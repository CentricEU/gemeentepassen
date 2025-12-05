package nl.centric.innovation.local4local.unit;

import static nl.centric.innovation.local4local.service.impl.GrantService.ORDER_CRITERIA;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import nl.centric.innovation.local4local.dto.GrantViewDtoTable;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.GrantRequestDto;
import nl.centric.innovation.local4local.dto.GrantViewDto;
import nl.centric.innovation.local4local.entity.Grant;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.CreatedForEnum;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.GrantRepository;
import nl.centric.innovation.local4local.service.impl.GrantService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
public class GrantServiceTests {

    @InjectMocks
    private GrantService grantService;

    private ResourceBundleMessageSource messageSource;

    @Mock
    private GrantRepository grantRepository;

    @Mock
    private TenantService tenantService;

    @Mock
    private PrincipalService princiaplService;

    private final UUID GRANT_ID = UUID.randomUUID();

    private static final UUID VALID_TENANT_ID = UUID.fromString("49e4c8e8-8956-11ee-b9d1-0242ac120002");
    private static final UUID INVALID_TENANT_ID = UUID.fromString("49e4c8e8-8956-11ee-b9d1-0242ac120114");

    private final LocalDate START_DATE = LocalDate.of(2023, 10, 2);
    private final LocalDate EXPIRATION_DATE = LocalDate.of(2023, 10, 4);

    private static Stream<Arguments> customAvailability() {
        return Stream.of(Arguments.of(LocalDate.now(), LocalDate.now()),
                Arguments.of(LocalDate.of(2023, 12, 10), LocalDate.of(2023, 10, 11)));
    }

    @BeforeEach
    public void setUp() {

        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasenames("i18n/messages");
        messageSource.setUseCodeAsDefaultMessage(true);

        ReflectionTestUtils.setField(grantService, "messageSource", messageSource);
    }

    @Test
    public void GivenValid_WhenGetAllPaginated_ThenListOfGrantViewDtoTableReturned() {
        // Given
        String language = "nl-NL";
        List<Grant> mockGrantsList = List.of(grantBuilder(), grantBuilder());
        Page<Grant> mockGrantPage = new PageImpl<>(mockGrantsList);
        Pageable pageable = PageRequest.of(0, 25, Sort.by(ORDER_CRITERIA));

        when(princiaplService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(grantRepository.findAllByTenantId(VALID_TENANT_ID, pageable)).thenReturn(mockGrantPage);

        List<GrantViewDtoTable> grantViewDtos = grantService.getAllPaginated(0, 25, language);

        assertNotNull(grantViewDtos);
        assertEquals(mockGrantsList.size(), grantViewDtos.size());
    }

    @Test
    @SneakyThrows
    public void GivenValidRequest_WhenCreateGrant_ThenExpectSuccess() {

        // Given
        GrantRequestDto requestDto = grantRequestDtoBuilder(LocalDate.of(2023, 10, 2),
                LocalDate.of(2023, 12, 11));

        Tenant tenant = new Tenant();
        User user = new User();
        user.setTenantId(VALID_TENANT_ID);

        // When
        when(princiaplService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(tenantService.findByTenantId(user.getTenantId())).thenReturn(Optional.of(tenant));
        when(grantRepository.save(any(Grant.class))).thenAnswer(invocation -> {
            Grant grant = invocation.getArgument(0);
            if (grant.getId() == null) {
                grant.setId(UUID.randomUUID());
            }
            return grant;
        });

        GrantViewDto result = grantService.createGrant(requestDto);

        // Then
        verify(grantRepository).save(any(Grant.class));

        assertNotNull(result);
    }

    @ParameterizedTest
    @MethodSource("customAvailability")
    public void GivenInvalidAvailability_WhenCreateGrant_ThenExpectDtoValidateException(LocalDate starDate, LocalDate expirationDate) {

        // Given
        GrantRequestDto requestDto = grantRequestDtoBuilder(starDate, expirationDate);

        // When
        assertThrows(DtoValidateException.class, () -> grantService.createGrant(requestDto));

        // Then
        verify(grantRepository, never()).save(any(Grant.class));
    }

    @Test
    public void GivenInvalidTenantId_WhenCreateGrant_ThenExpectDtoValidateNotFoundException() {

        // Given
        GrantRequestDto requestDto = grantRequestDtoBuilder(LocalDate.of(2023, 10, 2),
                LocalDate.of(2023, 12, 11));

        // When
        when(princiaplService.getTenantId()).thenReturn(INVALID_TENANT_ID);
        when(tenantService.findByTenantId(INVALID_TENANT_ID)).thenReturn(Optional.empty());
        assertThrows(DtoValidateNotFoundException.class, () -> grantService.createGrant(requestDto));

        // Then
        verify(grantRepository, never()).save(any(Grant.class));
    }

    @Test
    public void GivenNullParameter_WhenCreateGrant_ThenExpectIllegalArgumentException() {

        assertThrows(IllegalArgumentException.class, () -> grantRequestDtoBuilder(null, LocalDate.now()));

    }

    @Test
    public void GivenValid_WhenGetAll_ThenGrantViewDtosReturned() {
        // Given
        List<Grant> mockGrantsList = List.of(grantBuilder(), grantBuilder());

        // When
        when(princiaplService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(grantRepository.findAllByTenantId(VALID_TENANT_ID)).thenReturn(mockGrantsList);

        List<GrantViewDto> grantViewDtos = grantService.getAll(false);

        // Then
        assertNotNull(grantViewDtos);
        assertEquals(mockGrantsList.size(), grantViewDtos.size());
    }

    @Test
    public void GivenValid_WhenCountByTenantId_ThenShouldCount() {

        // Given
        Tenant tenant1 = new Tenant();
        tenant1.setId(VALID_TENANT_ID);
        // When
        when(princiaplService.getTenantId()).thenReturn(VALID_TENANT_ID);
        when(grantRepository.countByTenantId(VALID_TENANT_ID)).thenReturn(2);

        Integer count = grantService.countAll();

        assertEquals(2, count);
    }


    @Test
    public void GivenValidGrantIds_WhenGetAllInIds_ThenListOfGrantsShouldBeReturned() {
        // Given
        Set<Grant> mockGrantsList = Set.of(grantBuilder(), grantBuilder());

        Set<UUID> ids = new HashSet<>(Arrays.asList(UUID.randomUUID(), UUID.randomUUID()));
        // When
        when(grantRepository.findByIdIn(ids))
                .thenReturn(mockGrantsList);

        Set<Grant> grants = grantService.getAllInIds(ids);

        // Then
        assertNotNull(grants);
        assertEquals(mockGrantsList.size(), grants.size());
    }

    @Test
    public void GivenNonExistingGrantId_WhenEditGrant_ThenExpectDtoValidateException() {
        // Given
        GrantViewDto grantViewDto = grantViewDtoBuilder(START_DATE, EXPIRATION_DATE);

        // When
        when(grantRepository.findById(grantViewDto.id())).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateException.class, () -> {
            grantService.editGrant(grantViewDto);
        });

    }

    @Test
    public void GivenExpDateBiggerThenStartDate_WhenEditGrant_ThenExpectDtoValidateException() {
        // Given
        GrantViewDto grantViewDto = grantViewDtoBuilder(EXPIRATION_DATE, START_DATE);
        Grant grant = grantBuilder();

        // When
        when(grantRepository.findById(grantViewDto.id())).thenReturn(Optional.of(grant));

        // Then
        assertThrows(DtoValidateException.class, () -> {
            grantService.editGrant(grantViewDto);
        });

    }

    @Test
    @SneakyThrows
    public void GivenValidReq_WhenEditGrant_ThenExpectSuccess() {
        // Given
        Tenant tenant = new Tenant();
        tenant.setId(VALID_TENANT_ID);
        GrantViewDto grantViewDto = grantViewDtoBuilder(START_DATE, EXPIRATION_DATE);
        Grant grant = grantBuilder();
        grant.setTenant(tenant);

        Grant grantToSave = Grant.grantViewDtoToEntity(grantViewDto, tenant);
        grantToSave.setId(GRANT_ID);
        // When
        when(grantRepository.findById(grantViewDto.id())).thenReturn(Optional.of(grant));
        when(grantRepository.save(any(Grant.class))).thenReturn(grantToSave);

        // Then
        GrantViewDto result = grantService.editGrant(grantViewDto);

        assertNotNull(result);
    }

    private GrantRequestDto grantRequestDtoBuilder(LocalDate startDate, LocalDate expirationDate) {
        return GrantRequestDto.builder()
                .title("Title")
                .amount(0)
                .createFor(CreatedForEnum.PASS_OWNER)
                .description("Description")
                .startDate(startDate)
                .expirationDate(expirationDate)
                .build();
    }

    private Grant grantBuilder() {
        Grant grant = Grant.builder()
                .title("Title")
                .amount(0)
                .createFor(CreatedForEnum.PASS_OWNER)
                .description("Description")
                .startDate(LocalDate.of(2023, 10, 2))
                .expirationDate(LocalDate.of(2023, 10, 4))
                .build();
        grant.setId(GRANT_ID);
        return grant;
    }

    private GrantViewDto grantViewDtoBuilder(LocalDate startDate, LocalDate expirationDate) {

        return GrantViewDto.builder()
                .id(GRANT_ID)
                .title("Title")
                .createFor(CreatedForEnum.PASS_OWNER)
                .description("Description")
                .amount(10)
                .startDate(startDate)
                .expirationDate(expirationDate)
                .build();
    }

}
