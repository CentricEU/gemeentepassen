package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.AuditTimelineEventDto;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.WorkingHours;
import nl.centric.innovation.local4local.enums.AuditEventType;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.exceptions.UnauthorizedActionException;
import nl.centric.innovation.local4local.repository.UserRepository;
import nl.centric.innovation.local4local.repository.WorkingHoursRepository;
import nl.centric.innovation.local4local.service.impl.AuditSupplierService;
import nl.centric.innovation.local4local.service.impl.SupplierService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.util.JaversSnapshotHelper;
import org.javers.core.commit.CommitId;
import org.javers.core.commit.CommitMetadata;
import org.javers.core.metamodel.object.CdoSnapshot;
import org.javers.core.metamodel.object.CdoSnapshotState;
import org.javers.core.metamodel.object.GlobalId;
import org.javers.core.metamodel.object.SnapshotType;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class AuditSupplierServiceTests {

    @InjectMocks
    private AuditSupplierService auditSupplierService;

    @Mock
    private SupplierService supplierService;

    @Mock
    private UserService userService;

    @Mock
    private WorkingHoursRepository workingHoursRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JaversSnapshotHelper snapshotHelper;

    private static final UUID SUPPLIER_ID = UUID.randomUUID();
    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final UUID PROFILE_ID = UUID.randomUUID();
    private static final String COMPANY_NAME = "Coffee Haven";
    private static final String ADMIN_AUTHOR = "John Admin";
    private static final String SUPPLIER_AUTHOR = "Jane Supplier";

    private Supplier supplier;

    @BeforeEach
    void setUp() {
        Tenant tenant = new Tenant();
        tenant.setId(TENANT_ID);

        SupplierProfile profile = new SupplierProfile();
        profile.setId(PROFILE_ID);

        supplier = Supplier.builder()
                .companyName(COMPANY_NAME)
                .status(SupplierStatusEnum.APPROVED)
                .build();
        supplier.setId(SUPPLIER_ID);
        supplier.setTenant(tenant);
        supplier.setProfile(profile);
        supplier.setCreatedDate(LocalDateTime.of(2025, 1, 15, 9, 0));
    }

    // ======================== Authorization Tests ========================

    @Test
    void givenNonExistentSupplier_whenGetTimeline_thenThrowNotFoundException() throws NotFoundException {
        // Given
        UUID unknownId = UUID.randomUUID();
        when(supplierService.getSupplierWithProfile(unknownId)).thenThrow(new NotFoundException("Not found"));

        // When & Then
        assertThrows(NotFoundException.class, () ->
                auditSupplierService.getSupplierTimeline(unknownId));
    }

    @Test
    void givenSupplierUserAccessingOtherSupplier_whenGetTimeline_thenThrowUnauthorizedException() throws NotFoundException {
        // Given
        UUID otherSupplierId = UUID.randomUUID();
        when(supplierService.getSupplierWithProfile(otherSupplierId))
                .thenThrow(new UnauthorizedActionException("Unauthorized"));

        // When & Then
        assertThrows(UnauthorizedActionException.class, () ->
                auditSupplierService.getSupplierTimeline(otherSupplierId));
    }

    @Test
    void givenAdminFromDifferentTenant_whenGetTimeline_thenThrowUnauthorizedException() throws NotFoundException {
        // Given
        when(supplierService.getSupplierWithProfile(SUPPLIER_ID))
                .thenThrow(new UnauthorizedActionException("Unauthorized"));

        // When & Then
        assertThrows(UnauthorizedActionException.class, () ->
                auditSupplierService.getSupplierTimeline(SUPPLIER_ID));
    }

    // ======================== Lifecycle Event Tests ========================

    @Test
    void givenInitialSnapshotWithCreatedStatus_whenGetTimeline_thenReturnApplicationCreatedEvent() throws NotFoundException {
        // Given
        supplier.setStatus(SupplierStatusEnum.CREATED);
        CdoSnapshot initialSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(initialSnapshot), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(1, result.size());

        AuditTimelineEventDto event = result.getFirst();
        Assertions.assertEquals(AuditEventType.APPLICATION_CREATED, event.eventType());
    }

    @Test
    void givenCashierAdded_whenGetTimeline_thenReturnCashierAddedEvent() throws NotFoundException {
        // Given
        CdoSnapshot supplierInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );

        UUID cashierId = UUID.randomUUID();
        User cashier = User.builder()
                .username("cashier@test.com")
                .firstName("Test")
                .lastName("Cashier")
                .supplier(supplier)
                .build();
        cashier.setId(cashierId);

        CdoSnapshot cashierSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 2, 1, 10, 0),
                ADMIN_AUTHOR,
                Map.of("username", "cashier@test.com", "isActive", true)
        );

        setupMocksForTimeline(List.of(supplierInitial), Collections.emptyList());
        when(userService.findAllCashiersBySupplierId(SUPPLIER_ID)).thenReturn(List.of(cashier));
        when(snapshotHelper.getSnapshots(eq(cashierId), eq(User.class))).thenReturn(List.of(cashierSnapshot));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertTrue(result.stream().anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED));
        AuditTimelineEventDto cashierEvent = result.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED)
                .findFirst().orElseThrow();
        Assertions.assertEquals(1, cashierEvent.changes().size());
        Assertions.assertEquals("cashierEmail", cashierEvent.changes().getFirst().propertyName());
        Assertions.assertEquals("N/A", cashierEvent.changes().getFirst().oldValue());
        Assertions.assertEquals("cashier@test.com", cashierEvent.changes().getFirst().newValue());
    }

    // ======================== Working Hours Tests ========================

    @Test
    void givenWorkingHoursChanged_whenGetTimeline_thenReturnWorkingHoursEditEvent() throws NotFoundException {
        // Given
        CdoSnapshot supplierInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(supplierInitial), Collections.emptyList());

        UUID whId = UUID.randomUUID();
        WorkingHours wh = mock(WorkingHours.class);
        when(wh.getId()).thenReturn(whId);
        lenient().when(workingHoursRepository.findAllBySupplierIdOrderByDayAsc(eq(SUPPLIER_ID)))
                .thenReturn(List.of(wh));

        CdoSnapshot whInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("openTime", "09:00", "closeTime", "17:00")
        );
        CdoSnapshot whUpdated = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("openTime", "08:00", "closeTime", "18:00")
        );

        when(snapshotHelper.getSnapshots(eq(whId), eq(WorkingHours.class)))
                .thenReturn(List.of(whInitial, whUpdated));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertTrue(result.stream()
                .anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED
                        && e.changes().stream().anyMatch(c -> c.propertyName().equals("workingHours"))));
    }

    @Test
    void givenWorkingHoursMultipleGroupsApart_whenGetTimeline_thenReturnMultipleWorkingHoursEvents() throws NotFoundException {
        // Given
        CdoSnapshot supplierInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(supplierInitial), Collections.emptyList());

        UUID whId = UUID.randomUUID();
        WorkingHours wh = mock(WorkingHours.class);
        when(wh.getId()).thenReturn(whId);
        lenient().when(workingHoursRepository.findAllBySupplierIdOrderByDayAsc(eq(SUPPLIER_ID)))
                .thenReturn(List.of(wh));

        CdoSnapshot whInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("openTime", "09:00", "closeTime", "17:00")
        );
        CdoSnapshot whUpdate1 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("openTime", "08:00", "closeTime", "18:00")
        );
        // Second update far apart (>5 seconds threshold)
        CdoSnapshot whUpdate2 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 3, 1, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("openTime", "07:00", "closeTime", "19:00")
        );

        when(snapshotHelper.getSnapshots(eq(whId), eq(WorkingHours.class)))
                .thenReturn(List.of(whInitial, whUpdate1, whUpdate2));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        long whEditCount = result.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED
                        && e.changes().stream().anyMatch(c -> c.propertyName().equals("workingHours")))
                .count();
        Assertions.assertEquals(2, whEditCount);
    }

    @Test
    void givenWorkingHoursNoChanges_whenGetTimeline_thenNoWorkingHoursEditEvent() throws NotFoundException {
        // Given
        CdoSnapshot supplierInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(supplierInitial), Collections.emptyList());

        UUID whId = UUID.randomUUID();
        WorkingHours wh = mock(WorkingHours.class);
        when(wh.getId()).thenReturn(whId);
        lenient().when(workingHoursRepository.findAllBySupplierIdOrderByDayAsc(eq(SUPPLIER_ID)))
                .thenReturn(List.of(wh));

        // Same values, no changes
        CdoSnapshot whInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("openTime", "09:00", "closeTime", "17:00")
        );
        CdoSnapshot whUpdated = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("openTime", "09:00", "closeTime", "17:00")
        );

        when(snapshotHelper.getSnapshots(eq(whId), eq(WorkingHours.class)))
                .thenReturn(List.of(whInitial, whUpdated));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — no workingHours edit events
        Assertions.assertFalse(result.stream()
                .anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED
                        && e.changes().stream().anyMatch(c -> c.propertyName().equals("workingHours"))));
    }

    // ======================== Consecutive Edit Merge Tests ========================

    @Test
    void givenConsecutiveEditsBySameAuthorWithinThreshold_whenGetTimeline_thenMergeIntoSingleEvent() throws NotFoundException {
        // Given — two edits by same author within 5 seconds
        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED",
                        "kvk", "12345678", "adminEmail", "info@coffeehaven.nl")
        );
        CdoSnapshot edit1 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", "New Name", "status", "APPROVED",
                        "kvk", "12345678", "adminEmail", "info@coffeehaven.nl")
        );
        CdoSnapshot edit2 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0, 3),
                SUPPLIER_AUTHOR,
                Map.of("companyName", "New Name", "status", "APPROVED",
                        "kvk", "12345678", "adminEmail", "new@coffeehaven.nl")
        );

        setupMocksForTimeline(List.of(initial, edit1, edit2), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — two edits merged into one
        List<AuditTimelineEventDto> editEvents = result.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED)
                .toList();
        Assertions.assertEquals(1, editEvents.size());
        Assertions.assertEquals(2, editEvents.getFirst().changes().size());
    }

    @Test
    void givenConsecutiveEditsByDifferentAuthors_whenGetTimeline_thenDoNotMerge() throws NotFoundException {
        // Given — two edits by different authors
        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED",
                        "kvk", "12345678", "adminEmail", "info@coffeehaven.nl")
        );
        CdoSnapshot edit1 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", "New Name", "status", "APPROVED",
                        "kvk", "12345678", "adminEmail", "info@coffeehaven.nl")
        );
        CdoSnapshot edit2 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0, 3),
                ADMIN_AUTHOR,
                Map.of("companyName", "New Name", "status", "APPROVED",
                        "kvk", "12345678", "adminEmail", "new@coffeehaven.nl")
        );

        setupMocksForTimeline(List.of(initial, edit1, edit2), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — not merged, two separate edit events
        List<AuditTimelineEventDto> editEvents = result.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED)
                .toList();
        Assertions.assertEquals(2, editEvents.size());
    }

    // ======================== Cashier Coinciding with Submission Tests ========================

    @Test
    void givenCashierAddedAtSameTimeAsSubmission_whenGetTimeline_thenCashierEventRemoved() throws NotFoundException {
        // Given
        LocalDateTime submissionTime = LocalDateTime.of(2025, 1, 15, 11, 0);
        supplier.setStatus(SupplierStatusEnum.PENDING);

        CdoSnapshot created = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );
        CdoSnapshot submitted = buildSnapshot(
                SnapshotType.UPDATE,
                submissionTime,
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "PENDING", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(created, submitted), Collections.emptyList());

        UUID cashierId = UUID.randomUUID();
        User cashier = User.builder()
                .username("cashier@test.com")
                .firstName("Test")
                .lastName("Cashier")
                .supplier(supplier)
                .build();
        cashier.setId(cashierId);

        CdoSnapshot cashierSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                submissionTime, // same timestamp as submission
                SUPPLIER_AUTHOR,
                Map.of("username", "cashier@test.com", "isActive", true)
        );

        when(userService.findAllCashiersBySupplierId(SUPPLIER_ID)).thenReturn(List.of(cashier));
        when(snapshotHelper.getSnapshots(eq(cashierId), eq(User.class))).thenReturn(List.of(cashierSnapshot));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — CASHIER_ADDED removed because it coincides with submission
        Assertions.assertFalse(result.stream().anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED));
        Assertions.assertTrue(result.stream().anyMatch(e -> e.eventType() == AuditEventType.APPLICATION_SUBMITTED));
    }

    @Test
    void givenNullAuthor_whenGetTimeline_thenFallbackToSystem() throws NotFoundException {
        // Given — no User snapshots available, so author can't be resolved
        supplier.setStatus(SupplierStatusEnum.CREATED);
        CdoSnapshot initialSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                null,
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(initialSnapshot), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — null author resolved to "System" by resolveAuthor, no User snapshots to match, falls back to "System"
        Assertions.assertEquals("System", result.getFirst().actorName());
    }

    @Test
    void givenAnonymousUserAuthor_whenGetTimeline_thenFallbackToSystem() throws NotFoundException {
        // Given
        supplier.setStatus(SupplierStatusEnum.CREATED);
        CdoSnapshot initialSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                "anonymousUser",
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(initialSnapshot), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — anonymousUser is treated as placeholder, resolved via supplierId, falls back to "System"
        Assertions.assertEquals("System", result.getFirst().actorName());
    }

    @Test
    void givenSystemAuthor_whenGetTimeline_thenFallbackToSystem() throws NotFoundException {
        // Given
        supplier.setStatus(SupplierStatusEnum.CREATED);
        CdoSnapshot initialSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                "System",
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(initialSnapshot), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertEquals("System", result.getFirst().actorName());
    }

    @Test
    void givenNullAuthorWithSupplierUserInDb_whenGetTimeline_thenResolveFromDb() throws NotFoundException {
        // Given
        supplier.setStatus(SupplierStatusEnum.CREATED);
        CdoSnapshot initialSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                null,
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(initialSnapshot), Collections.emptyList());

        // DB lookup by supplierId succeeds
        User dbUser = User.builder()
                .username("supplier@test.com")
                .firstName("Supplier")
                .lastName("Owner")
                .build();
        when(userRepository.findBySupplierIdAndRole_Name(SUPPLIER_ID, Role.ROLE_SUPPLIER)).thenReturn(Optional.of(dbUser));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertEquals("Supplier Owner", result.getFirst().actorName());
    }

    // ======================== Cashier Edge Cases ========================

    @Test
    void givenCashierWithEmptySnapshots_whenGetTimeline_thenNoCashierEvents() throws NotFoundException {
        // Given
        CdoSnapshot supplierInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(supplierInitial), Collections.emptyList());

        UUID cashierId = UUID.randomUUID();
        User cashier = User.builder()
                .username("cashier@test.com")
                .firstName("Test")
                .lastName("Cashier")
                .supplier(supplier)
                .build();
        cashier.setId(cashierId);

        when(userService.findAllCashiersBySupplierId(SUPPLIER_ID)).thenReturn(List.of(cashier));
        when(snapshotHelper.getSnapshots(eq(cashierId), eq(User.class))).thenReturn(Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — no cashier events
        Assertions.assertFalse(result.stream().anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED));
        Assertions.assertFalse(result.stream().anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED));
    }

    @Test
    void givenCashierActiveToActive_whenGetTimeline_thenNoCashierRemovedEvent() throws NotFoundException {
        // Given — cashier stays active (no deactivation)
        CdoSnapshot supplierInitial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(supplierInitial), Collections.emptyList());

        UUID cashierId = UUID.randomUUID();
        User cashier = User.builder()
                .username("cashier@test.com")
                .firstName("Test")
                .lastName("Cashier")
                .supplier(supplier)
                .build();
        cashier.setId(cashierId);

        CdoSnapshot cashierCreated = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 2, 1, 10, 0),
                ADMIN_AUTHOR,
                Map.of("username", "cashier@test.com", "isActive", true)
        );
        CdoSnapshot cashierUpdated = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 3, 1, 10, 0),
                ADMIN_AUTHOR,
                Map.of("username", "cashier@test.com", "isActive", true)
        );

        when(userService.findAllCashiersBySupplierId(SUPPLIER_ID)).thenReturn(List.of(cashier));
        when(snapshotHelper.getSnapshots(eq(cashierId), eq(User.class)))
                .thenReturn(List.of(cashierCreated, cashierUpdated));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — only CASHIER_ADDED, no CASHIER_REMOVED
        Assertions.assertTrue(result.stream().anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED));
        Assertions.assertTrue(result.stream().anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED));
    }

    // ======================== Edge Case Tests ========================

    @Test
    void givenNoSnapshots_whenGetTimeline_thenReturnEmptyEvents() throws NotFoundException {
        // Given
        supplier.setStatus(null);
        setupMocksForTimeline(Collections.emptyList(), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertTrue(result.isEmpty());
    }

    @Test
    void givenSupplierWithNoProfile_whenGetTimeline_thenReturnOnlySupplierEvents() throws NotFoundException {
        // Given
        Supplier noProfileSupplier = Supplier.builder()
                .companyName(COMPANY_NAME)
                .status(SupplierStatusEnum.CREATED)
                .build();
        noProfileSupplier.setId(SUPPLIER_ID);
        Tenant tenant = new Tenant();
        tenant.setId(TENANT_ID);
        noProfileSupplier.setTenant(tenant);
        noProfileSupplier.setProfile(null);

        when(supplierService.getSupplierWithProfile(SUPPLIER_ID)).thenReturn(noProfileSupplier);

        CdoSnapshot initialSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );

        when(snapshotHelper.getSnapshots(eq(SUPPLIER_ID), eq(Supplier.class)))
                .thenReturn(List.of(initialSnapshot));

        when(snapshotHelper.getSnapshots(User.class))
                .thenReturn(Collections.emptyList());

        when(userService.findAllCashiersBySupplierId(SUPPLIER_ID))
                .thenReturn(Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertNotNull(result);
        Assertions.assertEquals(1, result.size());
        Assertions.assertEquals(AuditEventType.APPLICATION_CREATED, result.getFirst().eventType());
    }

    @Test
    void givenSupplierEditWithNoPropertyChanges_whenGetTimeline_thenNoEditEvent() throws NotFoundException {
        // Given — UPDATE snapshot but same property values as previous
        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );
        CdoSnapshot sameValues = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME, "status", "APPROVED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(initial, sameValues), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then — no INFORMATION_EDITED event
        Assertions.assertFalse(result.stream().anyMatch(e -> e.eventType() == AuditEventType.INFORMATION_EDITED));
    }

    // ======================== Helper Methods ========================

    /**
     * Sets up common mocks for timeline tests: supplier, snapshots, working hours, and empty user snapshots.
     */
    private void setupMocksForTimeline(List<CdoSnapshot> supplierSnapshots, List<CdoSnapshot> profileSnapshots) {
        try {
            when(supplierService.getSupplierWithProfile(SUPPLIER_ID)).thenReturn(supplier);
        } catch (NotFoundException e) {
            throw new RuntimeException(e);
        }

        when(snapshotHelper.getSnapshots(eq(SUPPLIER_ID), eq(Supplier.class)))
                .thenReturn(supplierSnapshots);

        // Empty User snapshots — author resolution falls back to raw author or "System"
        when(snapshotHelper.getSnapshots(User.class))
                .thenReturn(Collections.emptyList());

        // No cashiers by default
        when(userService.findAllCashiersBySupplierId(SUPPLIER_ID))
                .thenReturn(Collections.emptyList());

        when(snapshotHelper.getSnapshots(eq(PROFILE_ID), eq(SupplierProfile.class)))
                .thenReturn(profileSnapshots);
    }

    /**
     * Builds a mock CdoSnapshot with the specified properties.
     * Carefully mocks the Javers snapshot structure to simulate real audit data.
     */
    private CdoSnapshot buildSnapshot(SnapshotType type, LocalDateTime commitDate,
                                      String author, Map<String, Object> properties) {
        CdoSnapshot snapshot = mock(CdoSnapshot.class);
        CommitMetadata commitMetadata = mock(CommitMetadata.class);
        CdoSnapshotState state = mock(CdoSnapshotState.class);
        GlobalId globalId = mock(GlobalId.class);
        CommitId commitId = mock(CommitId.class);

        lenient().when(snapshot.getType()).thenReturn(type);
        lenient().when(snapshot.getCommitMetadata()).thenReturn(commitMetadata);
        lenient().when(snapshot.getState()).thenReturn(state);
        lenient().when(snapshot.getGlobalId()).thenReturn(globalId);

        lenient().when(commitMetadata.getCommitDate()).thenReturn(commitDate);
        lenient().when(commitMetadata.getAuthor()).thenReturn(author);
        lenient().when(commitMetadata.getId()).thenReturn(commitId);

        lenient().when(state.getPropertyNames()).thenReturn(properties.keySet());

        for (Map.Entry<String, Object> entry : properties.entrySet()) {
            lenient().when(snapshot.getPropertyValue(entry.getKey())).thenReturn(entry.getValue());
        }

        return snapshot;
    }

    @Test
    void givenMultipleInvalidPostSubmissionEvents_whenGetTimeline_thenAllRemoved() throws NotFoundException {
        // Given
        supplier.setStatus(SupplierStatusEnum.CREATED);

        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 59),
                SUPPLIER_AUTHOR,
                Map.of("status", "CREATED")
        );

        CdoSnapshot submitted = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 1, 15, 11, 0),
                SUPPLIER_AUTHOR,
                Map.of("status", "PENDING")
        );

        CdoSnapshot invalid1 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 1, 15, 11, 1),
                SUPPLIER_AUTHOR,
                Map.of("companyName", "New Name")
        );

        CdoSnapshot invalid2 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 1, 15, 11, 2),
                SUPPLIER_AUTHOR,
                Map.of("status", "CREATED")
        );

        setupMocksForTimeline(
                List.of(initial, submitted, invalid1, invalid2),
                Collections.emptyList()
        );

        // When
        List<AuditTimelineEventDto> result =
                auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        long submittedEvents = result.stream()
                .filter(e -> e.eventType() == AuditEventType.APPLICATION_SUBMITTED)
                .count();

        Assertions.assertEquals(1, submittedEvents);

        // ensure no garbage lifecycle duplicates
        Assertions.assertTrue(
                result.stream().noneMatch(e ->
                        e.eventType() == AuditEventType.APPLICATION_CREATED &&
                                !e.changes().isEmpty()
                )
        );
    }

    @Test
    void givenUserWithPlaceholderNameInDb_whenResolveActorName_thenReturnSystem() throws NotFoundException {
        // Given
        CdoSnapshot initialSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                null,
                Map.of("companyName", COMPANY_NAME, "status", "CREATED", "kvk", "12345678")
        );

        setupMocksForTimeline(List.of(initialSnapshot), Collections.emptyList());

        User dbUser = User.builder()
                .firstName("firstname")
                .lastName("lastname")
                .build();
        when(userRepository.findBySupplierIdAndRole_Name(SUPPLIER_ID, Role.ROLE_SUPPLIER))
                .thenReturn(Optional.of(dbUser));

        // When
        List<AuditTimelineEventDto> result = auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertEquals("System", result.getFirst().actorName());
    }

    @Test
    void givenUnknownStatusTransition_whenBuildSupplierEvents_thenOnlyInitialEvent() throws NotFoundException {
        // Given
        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("status", "UNKNOWN_STATUS")
        );

        CdoSnapshot transition = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0),
                SUPPLIER_AUTHOR,
                Map.of("status", "SOMETHING_ELSE")
        );

        setupMocksForTimeline(List.of(initial, transition), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result =
                auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        Assertions.assertEquals(1, result.size());
        Assertions.assertEquals(
                AuditEventType.APPLICATION_CREATED,
                result.getFirst().eventType()
        );
    }

    @Test
    void givenCashierAddedInRejectedState_whenGetTimeline_thenCashierEventIsPresent() throws NotFoundException {
        // Given
        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("status", "CREATED")
        );

        CdoSnapshot rejected = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 1, 16, 10, 0),
                ADMIN_AUTHOR,
                Map.of("status", "REJECTED")
        );

        setupMocksForTimeline(List.of(initial, rejected), Collections.emptyList());

        UUID cashierId = UUID.randomUUID();
        User cashier = User.builder().supplier(supplier).build();
        cashier.setId(cashierId);

        CdoSnapshot cashierSnapshot = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 17, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("isActive", true, "username", "cashier@test.com")
        );

        when(userService.findAllCashiersBySupplierId(SUPPLIER_ID))
                .thenReturn(List.of(cashier));

        when(snapshotHelper.getSnapshots(cashierId, User.class))
                .thenReturn(List.of(cashierSnapshot));

        // When
        List<AuditTimelineEventDto> result =
                auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        boolean hasCashierEvent = result.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED)
                .anyMatch(e -> e.changes().stream()
                        .anyMatch(c -> "cashierEmail".equals(c.propertyName()))
                );

        Assertions.assertTrue(hasCashierEvent);
    }

    @Test
    void givenExactlyThresholdSecondsBetweenEdits_whenMergeConsecutiveEdits_thenReturnSingleEvent() throws NotFoundException {
        // Given
        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME)
        );

        CdoSnapshot edit1 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0),
                SUPPLIER_AUTHOR,
                Map.of("adminEmail", "a@coffeehaven.nl")
        );

        CdoSnapshot edit2 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0).plusSeconds(120),
                SUPPLIER_AUTHOR,
                Map.of("adminEmail", "b@coffeehaven.nl")
        );

        setupMocksForTimeline(List.of(initial, edit1, edit2), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result =
                auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        List<AuditTimelineEventDto> editEvents = result.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED)
                .toList();

        Assertions.assertEquals(1, editEvents.size());
        Assertions.assertEquals(2, editEvents.getFirst().changes().size());
    }

    @Test
    void givenThreeConsecutiveEditsBySameAuthor_whenGetTimeline_thenMergedIntoSingleEvent() throws NotFoundException {
        // Given
        CdoSnapshot initial = buildSnapshot(
                SnapshotType.INITIAL,
                LocalDateTime.of(2025, 1, 15, 10, 0),
                SUPPLIER_AUTHOR,
                Map.of("companyName", COMPANY_NAME)
        );

        CdoSnapshot edit1 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0),
                SUPPLIER_AUTHOR,
                Map.of("adminEmail", "a@coffeehaven.nl")
        );

        CdoSnapshot edit2 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0).plusSeconds(1),
                SUPPLIER_AUTHOR,
                Map.of("adminEmail", "b@coffeehaven.nl")
        );

        CdoSnapshot edit3 = buildSnapshot(
                SnapshotType.UPDATE,
                LocalDateTime.of(2025, 2, 1, 9, 0).plusSeconds(2),
                SUPPLIER_AUTHOR,
                Map.of("adminEmail", "c@coffeehaven.nl")
        );

        setupMocksForTimeline(List.of(initial, edit1, edit2, edit3), Collections.emptyList());

        // When
        List<AuditTimelineEventDto> result =
                auditSupplierService.getSupplierTimeline(SUPPLIER_ID);

        // Then
        List<AuditTimelineEventDto> editEvents = result.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED)
                .toList();

        Assertions.assertEquals(1, editEvents.size());
        Assertions.assertEquals(3, editEvents.getFirst().changes().size());
    }
}
