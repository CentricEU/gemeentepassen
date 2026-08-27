package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.dto.AuditPropertyChangeDto;
import nl.centric.innovation.local4local.dto.AuditTimelineEventDto;
import nl.centric.innovation.local4local.dto.TimelineContext;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.SupplierProfile;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.WorkingHours;
import nl.centric.innovation.local4local.enums.AuditEventType;
import nl.centric.innovation.local4local.enums.StatusUpdateEnum;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.NotFoundException;
import nl.centric.innovation.local4local.repository.UserRepository;
import nl.centric.innovation.local4local.repository.WorkingHoursRepository;
import nl.centric.innovation.local4local.util.JaversSnapshotHelper;
import org.javers.core.commit.CommitMetadata;
import org.javers.core.metamodel.object.CdoSnapshot;
import org.javers.core.metamodel.object.InstanceId;
import org.javers.core.metamodel.object.SnapshotType;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static nl.centric.innovation.local4local.util.Constants.NOT_AVAILABLE;

/**
 * Service responsible for building the supplier audit timeline from Javers snapshots.
 * <p>
 * Combines lifecycle events (created, submitted, approved, rejected, confirmed)
 * with property-change events from Supplier, SupplierProfile, WorkingHours, and User entities.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditSupplierService {

    private final SupplierService supplierService;
    private final UserService userService;
    private final WorkingHoursRepository workingHoursRepository;
    private final UserRepository userRepository;
    private final JaversSnapshotHelper snapshotHelper;

    private static final long APPROVAL_MERGE_THRESHOLD_SECONDS = 10;
    private static final long WORKING_HOURS_GROUP_THRESHOLD_SECONDS = 5;


    private static final Set<String> IGNORED_SUPPLIER_PROPERTIES = Set.of(
            "status", "statusUpdate", "isProfileSet", "isReviewed", "workingHours",
            "id", "createdDate"
    );

    private static final Set<String> IGNORED_PROFILE_PROPERTIES = Set.of("id", "createdDate", "coordinatesString");

    private static final Set<String> IGNORED_WORKING_HOURS_PROPERTIES = Set.of("id", "day", "supplier");

    private static final Set<AuditEventType> ALLOWED_AFTER_SUBMISSION = Set.of(
            AuditEventType.APPLICATION_APPROVED,
            AuditEventType.APPLICATION_REJECTED,
            AuditEventType.APPLICATION_APPROVED_WITH_EDITS,
            AuditEventType.APPLICATION_CONFIRMED,
            AuditEventType.APPLICATION_SUBMITTED
    );

    /**
     * Builds the full audit timeline for a supplier, combining events from
     * Supplier, SupplierProfile, WorkingHours, and User Javers snapshots.
     */
    public List<AuditTimelineEventDto> getSupplierTimeline(UUID supplierId) throws NotFoundException {
        Supplier supplier = supplierService.getSupplierWithProfile(supplierId);

        TimelineContext context = buildContext(supplier, supplierId);

        List<AuditTimelineEventDto> events = buildEvents(context);

        processEvents(events, context);

        Collections.reverse(events);

        return events;
    }

    private TimelineContext buildContext(Supplier supplier, UUID supplierId) {
        List<CdoSnapshot> allUserSnapshots = snapshotHelper.getSnapshots(User.class);
        List<CdoSnapshot> supplierSnapshots = snapshotHelper.getSnapshots(supplierId, Supplier.class);
        List<CdoSnapshot> profileSnapshots = fetchProfileSnapshots(supplier);

        return new TimelineContext(
                supplier,
                supplierId,
                allUserSnapshots,
                supplierSnapshots,
                profileSnapshots
        );
    }

    private void processEvents(List<AuditTimelineEventDto> events, TimelineContext context) {
        mergeApprovalWithNearbyEdits(events);

        addUserConfirmationEvents(
                events,
                context.supplierId(),
                context.allUserSnapshots()
        );

        sortByTimestamp(events);

        enforcePostSubmissionEventRules(events);

        mergeConsecutiveEditsByAuthor(events);

        removeLeadingApproval(events);

        mergeConsecutiveApprovalWithEditsAndInfoEditedBySameAuthor(events);
    }

    private void enforcePostSubmissionEventRules(List<AuditTimelineEventDto> events) {

        for (int i = 0; i < events.size() - 1; i++) {

            AuditTimelineEventDto current = events.get(i);

            if (current.eventType() != AuditEventType.APPLICATION_SUBMITTED) {
                continue;
            }

            AuditTimelineEventDto next = events.get(i + 1);

            if (!ALLOWED_AFTER_SUBMISSION.contains(next.eventType())) {
                events.remove(i + 1);
            }

            return;
        }
    }

    private void sortByTimestamp(List<AuditTimelineEventDto> events) {
        events.sort(Comparator.comparing(AuditTimelineEventDto::timestamp));
    }

    private void removeLeadingApproval(List<AuditTimelineEventDto> events) {
        if (!events.isEmpty()) {
            AuditEventType type = events.getFirst().eventType();

            if (type == AuditEventType.APPLICATION_APPROVED ||
                    type == AuditEventType.APPLICATION_APPROVED_WITH_EDITS) {
                events.removeFirst();
            }
        }
    }

    private List<AuditTimelineEventDto> buildEvents(TimelineContext context) {
        List<AuditTimelineEventDto> events = new ArrayList<>();

        events.addAll(buildSupplierEvents(
                context.supplierSnapshots(),
                context.supplierId()
        ));

        events.addAll(buildProfileEditEvents(
                context.profileSnapshots(),
                context.supplierId()
        ));

        events.addAll(buildWorkingHoursEvents(
                context.supplierId()
        ));

        events.addAll(buildCashierEvents(
                context.supplierId(),
                context.supplierSnapshots()
        ));

        return events;
    }

    // Snapshot Fetching

    private List<CdoSnapshot> fetchProfileSnapshots(Supplier supplier) {
        SupplierProfile profile = supplier.getProfile();

        if (profile == null) {
            return Collections.emptyList();
        }
        return snapshotHelper.getSnapshots(profile.getId(), SupplierProfile.class);
    }

    // Supplier Events

    /**
     * Builds lifecycle and edit events from Supplier entity snapshots.
     * Each snapshot is compared to its predecessor to detect status transitions or property edits.
     */
    private List<AuditTimelineEventDto> buildSupplierEvents(List<CdoSnapshot> snapshots, UUID supplierId) {

        return iterateSnapshotPairs(snapshots, (previous, current) -> {
            String author = resolveActorName(current.getCommitMetadata(), supplierId);
            LocalDateTime timestamp = current.getCommitMetadata().getCommitDate();

            if (current.getType() == SnapshotType.INITIAL) {
                return Optional.of(buildInitialEvent(current, timestamp, author));
            }

            return detectStatusTransition(previous, current)
                    .map(status -> buildStatusTransitionEvent(current, previous, timestamp, author, status))
                    .or(() -> buildEditEventIfChanged(previous, current, timestamp, author,
                            IGNORED_SUPPLIER_PROPERTIES));
        });
    }

    private AuditTimelineEventDto buildInitialEvent(CdoSnapshot snapshot, LocalDateTime timestamp, String author) {
        String status = JaversSnapshotHelper.getPropertyAsString(snapshot, "status");

        AuditEventType eventType = SupplierStatusEnum.PENDING.name().equals(status)
                ? AuditEventType.APPLICATION_SUBMITTED
                : AuditEventType.APPLICATION_CREATED;

        return buildSimpleEvent(eventType, timestamp, author);
    }

    // Status Transitions

    /**
     * Detects a status change between two consecutive snapshots.
     */
    private Optional<SupplierStatusEnum> detectStatusTransition(CdoSnapshot previous, CdoSnapshot current) {
        String currentStatus = JaversSnapshotHelper.getPropertyAsString(current, "status");
        String previousStatus = JaversSnapshotHelper.getPropertyAsString(previous, "status");

        if (Objects.equals(currentStatus, previousStatus) || currentStatus == null) {
            return Optional.empty();
        }

        try {
            return Optional.of(SupplierStatusEnum.valueOf(currentStatus));
        } catch (IllegalArgumentException e) {
            log.warn("Unknown supplier status transition to: {}", currentStatus);
            return Optional.empty();
        }
    }

    /**
     * Maps a status transition to the appropriate timeline event.
     */
    private AuditTimelineEventDto buildStatusTransitionEvent(CdoSnapshot current, CdoSnapshot previous,
                                                             LocalDateTime timestamp, String author,
                                                             SupplierStatusEnum status) {
        return switch (status) {
            case PENDING -> buildSimpleEvent(AuditEventType.APPLICATION_SUBMITTED, timestamp, author);
            case REJECTED -> buildSimpleEvent(AuditEventType.APPLICATION_REJECTED, timestamp, author);
            case APPROVED -> buildApprovalEvent(current, previous, timestamp, author);
            case CREATED -> {
                log.warn("Unexpected transition to CREATED status");
                yield buildSimpleEvent(AuditEventType.APPLICATION_CREATED, timestamp, author);
            }
        };
    }

    /**
     * Builds an APPLICATION_APPROVED or APPLICATION_APPROVED_WITH_EDITS event,
     * depending on whether property changes accompanied the approval.
     */
    private AuditTimelineEventDto buildApprovalEvent(CdoSnapshot current, CdoSnapshot previous,
                                                     LocalDateTime timestamp, String author) {
        String statusUpdate = JaversSnapshotHelper.getPropertyAsString(current, "statusUpdate");

        boolean isWithChanges = StatusUpdateEnum.WITH_CHANGES.name().equals(statusUpdate);

        List<AuditPropertyChangeDto> changes = JaversSnapshotHelper.computeChanges(
                previous, current, IGNORED_SUPPLIER_PROPERTIES);

        if (isWithChanges) {
            return AuditTimelineEventDto.builder()
                    .eventType(AuditEventType.APPLICATION_APPROVED_WITH_EDITS)
                    .timestamp(timestamp)
                    .actorName(author)
                    .changes(changes)
                    .build();
        }

        return buildSimpleEvent(AuditEventType.APPLICATION_APPROVED, timestamp, author);
    }

    // Profile Edit Events

    private List<AuditTimelineEventDto> buildProfileEditEvents(List<CdoSnapshot> profileSnapshots, UUID supplierId) {
        return buildEditEventsFromSnapshots(profileSnapshots, IGNORED_PROFILE_PROPERTIES,
                supplierId);
    }

    /**
     * Builds INFORMATION_EDITED events from entity Javers snapshots by comparing consecutive pairs.
     */
    private List<AuditTimelineEventDto> buildEditEventsFromSnapshots(List<CdoSnapshot> snapshots,
                                                                     Set<String> ignoredProperties,
                                                                     UUID supplierId) {
        return iterateSnapshotPairs(snapshots, (previous, current) -> {
            if (current.getType() == SnapshotType.INITIAL) {
                return Optional.empty();
            }

            String author = resolveActorName(current.getCommitMetadata(), supplierId);
            LocalDateTime timestamp = current.getCommitMetadata().getCommitDate();
            return buildEditEventIfChanged(previous, current, timestamp, author, ignoredProperties);
        });
    }

    // Working Hours Events

    /**
     * Builds INFORMATION_EDITED events from WorkingHours Javers snapshots,
     * grouping temporally close changes into single events.
     */
    private List<AuditTimelineEventDto> buildWorkingHoursEvents(UUID supplierId) {
        List<WorkingHours> workingHoursList = workingHoursRepository.findAllBySupplierIdOrderByDayAsc(supplierId);
        if (workingHoursList.isEmpty()) {
            return Collections.emptyList();
        }

        List<WorkingHoursChangeRecord> allRecords = workingHoursList.stream()
                .flatMap(wh -> computeWorkingHoursChanges(wh, supplierId).stream())
                .sorted(Comparator.comparing(WorkingHoursChangeRecord::timestamp))
                .toList();

        return groupWorkingHoursChanges(allRecords);
    }

    private List<WorkingHoursChangeRecord> computeWorkingHoursChanges(WorkingHours wh, UUID supplierId) {
        List<CdoSnapshot> snapshots = snapshotHelper.getSnapshots(wh.getId(), WorkingHours.class);

        return iterateSnapshotPairs(snapshots, (previous, current) -> {
            if (current.getType() == SnapshotType.INITIAL) {
                return Optional.empty();
            }

            List<AuditPropertyChangeDto> changes = JaversSnapshotHelper.computeChanges(
                    previous, current, IGNORED_WORKING_HOURS_PROPERTIES);

            if (changes.isEmpty()) {
                return Optional.empty();
            }

            CommitMetadata commit = current.getCommitMetadata();
            String author = resolveActorName(commit, supplierId);
            return Optional.of(new WorkingHoursChangeRecord(commit.getCommitDate(), author));
        });
    }

    /**
     * Groups temporally close working-hours changes into single INFORMATION_EDITED events.
     */
    private List<AuditTimelineEventDto> groupWorkingHoursChanges(List<WorkingHoursChangeRecord> records) {
        if (records.isEmpty()) {
            return Collections.emptyList();
        }

        List<AuditPropertyChangeDto> workingHoursChange = List.of(AuditPropertyChangeDto.builder()
                .propertyName("workingHours")
                .oldValue(NOT_AVAILABLE)
                .newValue(NOT_AVAILABLE)
                .build());

        List<AuditTimelineEventDto> events = new ArrayList<>();
        WorkingHoursChangeRecord currentGroupStart = records.getFirst();

        for (int i = 1; i < records.size(); i++) {
            WorkingHoursChangeRecord record = records.get(i);
            boolean withinThreshold = Duration.between(currentGroupStart.timestamp(), record.timestamp()).toSeconds()
                    <= WORKING_HOURS_GROUP_THRESHOLD_SECONDS;

            if (!withinThreshold) {
                events.add(buildEditEvent(currentGroupStart.timestamp(), currentGroupStart.author(), new ArrayList<>(workingHoursChange)));
                currentGroupStart = record;
            }
        }

        events.add(buildEditEvent(currentGroupStart.timestamp(), currentGroupStart.author(), new ArrayList<>(workingHoursChange)));
        return events;
    }

    private record WorkingHoursChangeRecord(LocalDateTime timestamp, String author) {
    }

    // Cashier Events

    /**
     * Builds CASHIER_ADDED and CASHIER_REMOVED events from User Javers snapshots
     * for users with the CASHIER role linked to this supplier.
     * Uses DB to identify cashier user IDs, then retrieves their Javers snapshots.
     */
    private List<AuditTimelineEventDto> buildCashierEvents(UUID supplierId, List<CdoSnapshot> supplierSnapshots) {
        List<User> cashiers = userService.findAllCashiersBySupplierId(supplierId);

        if (cashiers.isEmpty()) {
            return Collections.emptyList();
        }

        List<AuditTimelineEventDto> events = new ArrayList<>();

        for (User cashier : cashiers) {
            List<CdoSnapshot> cashierSnapshots = snapshotHelper.getSnapshots(cashier.getId(), User.class);

            if (cashierSnapshots.isEmpty()) {
                continue;
            }

            List<AuditTimelineEventDto> cashierEvents =
                    buildCashierSnapshotEvents(cashierSnapshots, supplierId);

            events.addAll(
                    cashierEvents.stream()
                            .filter(event -> isSupplierInAllowedStateAt(
                                    event.timestamp(),
                                    supplierSnapshots))
                            .toList()
            );

        }

        return events;
    }

    private boolean isSupplierInAllowedStateAt(LocalDateTime timestamp,
                                               List<CdoSnapshot> supplierSnapshots) {

        List<CdoSnapshot> relevantSnapshots = supplierSnapshots.stream()
                .filter(s -> !s.getCommitMetadata().getCommitDate().isAfter(timestamp))
                .sorted(Comparator.comparing(s -> s.getCommitMetadata().getCommitDate()))
                .toList();

        if (relevantSnapshots.isEmpty()) {
            return false;
        }

        CdoSnapshot current = relevantSnapshots.getLast();

        String currentStatus = JaversSnapshotHelper.getPropertyAsString(current, "status");

        String previousStatus = null;
        if (relevantSnapshots.size() > 1) {
            CdoSnapshot previous = relevantSnapshots.get(relevantSnapshots.size() - 2);
            previousStatus = JaversSnapshotHelper.getPropertyAsString(previous, "status");
        }

        if (SupplierStatusEnum.APPROVED.name().equals(currentStatus)
                && SupplierStatusEnum.CREATED.name().equals(previousStatus)) {
            return false;
        }

        return SupplierStatusEnum.PENDING.name().equals(currentStatus)
                || SupplierStatusEnum.APPROVED.name().equals(currentStatus)
                || SupplierStatusEnum.REJECTED.name().equals(currentStatus);
    }

    private List<AuditTimelineEventDto> buildCashierSnapshotEvents(List<CdoSnapshot> snapshots, UUID supplierId) {
        return iterateSnapshotPairs(snapshots, (previous, current) -> {
            CommitMetadata commit = current.getCommitMetadata();
            String author = resolveActorName(commit, supplierId);
            LocalDateTime timestamp = commit.getCommitDate();
            String cashierUsername = JaversSnapshotHelper.getPropertyAsString(current, "username");

            if (current.getType() == SnapshotType.INITIAL) {
                return Optional.of(buildCashierEvent(timestamp, author, NOT_AVAILABLE, cashierUsername));
            }

            boolean wasActive = JaversSnapshotHelper.isTruthy(
                    JaversSnapshotHelper.getSnapshotProperty(previous, "isActive"));
            boolean isNowActive = JaversSnapshotHelper.isTruthy(
                    JaversSnapshotHelper.getSnapshotProperty(current, "isActive"));

            if (wasActive && !isNowActive) {
                String previousUsername = JaversSnapshotHelper.getPropertyAsString(previous, "username");
                return Optional.of(buildCashierEvent(timestamp, author, previousUsername, null));
            }

            return Optional.empty();
        });
    }

    private AuditTimelineEventDto buildCashierEvent(LocalDateTime timestamp, String author,
                                                    String oldValue, String newValue) {

        List<AuditPropertyChangeDto> changes = List.of(AuditPropertyChangeDto.builder()
                .propertyName("cashierEmail")
                .oldValue(oldValue)
                .newValue(newValue)
                .build());

        return AuditTimelineEventDto.builder()
                .eventType(AuditEventType.INFORMATION_EDITED)
                .timestamp(timestamp)
                .actorName(author)
                .changes(changes)
                .build();
    }

    // Approval-Edit Merge

    /**
     * Merges INFORMATION_EDITED events by the same author as the approval event
     * into a single APPLICATION_APPROVED_WITH_EDITS event,
     * but only if they fall within the APPROVAL_MERGE_THRESHOLD_SECONDS window.
     */
    private void mergeApprovalWithNearbyEdits(List<AuditTimelineEventDto> events) {
        Optional<AuditTimelineEventDto> approvedOpt = events.stream()
                .filter(e -> e.eventType() == AuditEventType.APPLICATION_APPROVED
                        || e.eventType() == AuditEventType.APPLICATION_APPROVED_WITH_EDITS)
                .findFirst();

        if (approvedOpt.isEmpty()) {
            return;
        }

        AuditTimelineEventDto approved = approvedOpt.get();
        LocalDateTime approvalTime = approved.timestamp();
        String approvalActor = approved.actorName() != null ? approved.actorName().trim() : null;

        // Only merge edits that are by the EXACT same approval actor (case-sensitive, trimmed), and strictly BEFORE approval (not after)
        List<AuditTimelineEventDto> nearbyEdits = events.stream()
                .filter(e -> e.eventType() == AuditEventType.INFORMATION_EDITED)
                .filter(e -> {
                    String editActor = e.actorName() != null ? e.actorName().trim() : null;
                    return Objects.equals(editActor, approvalActor);
                })
                .filter(e -> !e.changes().isEmpty())
                .filter(e -> e.timestamp().isBefore(approvalTime) ||
                        e.timestamp().isEqual(approvalTime))
                .filter(e -> isWithinSeconds(e.timestamp(), approvalTime, APPROVAL_MERGE_THRESHOLD_SECONDS))
                .sorted(Comparator.comparing(AuditTimelineEventDto::timestamp))
                .toList();

        if (nearbyEdits.isEmpty()) {
            return;
        }

        List<AuditPropertyChangeDto> mergedChanges = new ArrayList<>(approved.changes());
        nearbyEdits.forEach(edit -> mergedChanges.addAll(edit.changes()));

        AuditTimelineEventDto merged = AuditTimelineEventDto.builder()
                .eventType(AuditEventType.APPLICATION_APPROVED_WITH_EDITS)
                .timestamp(approved.timestamp())
                .actorName(approved.actorName())
                .changes(mergedChanges)
                .build();

        events.remove(approved);
        events.removeAll(nearbyEdits);
        events.add(merged);
    }


    // Consecutive Edit Merge

    private static final long CONSECUTIVE_EDIT_MERGE_THRESHOLD_SECONDS = 120;

    /**
     * Merges consecutive INFORMATION_EDITED events by the same author
     * into a single INFORMATION_EDITED event, only if they are within the time threshold.
     * Must be called after sorting by timestamp.
     */
    private void mergeConsecutiveEditsByAuthor(List<AuditTimelineEventDto> events) {
        List<AuditTimelineEventDto> merged = new ArrayList<>();

        for (AuditTimelineEventDto event : events) {
            if (!merged.isEmpty() && shouldMergeEdits(merged.getLast(), event)) {
                AuditTimelineEventDto previous = merged.removeLast();
                List<AuditPropertyChangeDto> mergedChanges = new ArrayList<>(previous.changes());
                mergedChanges.addAll(event.changes());

                merged.add(AuditTimelineEventDto.builder()
                        .eventType(AuditEventType.INFORMATION_EDITED)
                        .timestamp(previous.timestamp())
                        .actorName(previous.actorName())
                        .changes(mergedChanges)
                        .build());
            } else {
                merged.add(event);
            }
        }

        events.clear();
        events.addAll(merged);
    }

    private boolean shouldMergeEdits(AuditTimelineEventDto current, AuditTimelineEventDto next) {
        // Only merge if BOTH are INFORMATION_EDITED
        return current.eventType() == AuditEventType.INFORMATION_EDITED
                && next.eventType() == AuditEventType.INFORMATION_EDITED
                && Objects.equals(current.actorName(), next.actorName())
                && isWithinSeconds(current.timestamp(), next.timestamp(), CONSECUTIVE_EDIT_MERGE_THRESHOLD_SECONDS);
    }

    // User Confirmation Events

    /**
     * Detects isEnabled false→true transitions in User snapshots and adds APPLICATION_CONFIRMED events.
     * Checks ALL users linked to this supplier (not just the first match) to avoid
     * non-deterministic HashMap ordering issues when cashier users are also present.
     */
    private void addUserConfirmationEvents(List<AuditTimelineEventDto> events, UUID supplierId,
                                           List<CdoSnapshot> allUserSnapshots) {
        findAllUserSnapshotGroupsBySupplierId(allUserSnapshots, supplierId)
                .forEach(userSnapshots -> events.addAll(
                        buildUserConfirmationEvents(userSnapshots, supplierId)));
    }

    private List<AuditTimelineEventDto> buildUserConfirmationEvents(List<CdoSnapshot> snapshots, UUID supplierId) {
        return iterateSnapshotPairs(snapshots, (previous, current) -> {
            if (current.getType() == SnapshotType.INITIAL) {
                return Optional.empty();
            }

            boolean wasDisabled = JaversSnapshotHelper.isFalsy(
                    JaversSnapshotHelper.getSnapshotProperty(previous, "isEnabled"));
            boolean isNowEnabled = JaversSnapshotHelper.isTruthy(
                    JaversSnapshotHelper.getSnapshotProperty(current, "isEnabled"));

            if (!wasDisabled || !isNowEnabled) {
                return Optional.empty();
            }

            String author = resolveActorName(current.getCommitMetadata(), supplierId);
            return Optional.of(buildSimpleEvent(
                    AuditEventType.APPLICATION_CONFIRMED, current.getCommitMetadata().getCommitDate(), author));
        });
    }

    /**
     * Returns snapshot lists for ALL users linked to this supplier,
     * each sorted by commit date. This ensures we check every user
     * (main supplier user, cashier users, etc.) for confirmation events.
     */
    private List<List<CdoSnapshot>> findAllUserSnapshotGroupsBySupplierId(List<CdoSnapshot> allUserSnapshots,
                                                                          UUID supplierId) {
        String supplierIdStr = supplierId.toString();

        Map<String, List<CdoSnapshot>> snapshotsByUser = allUserSnapshots.stream()
                .filter(snapshot -> supplierIdStr.equals(extractSupplierRefId(snapshot)))
                .collect(Collectors.groupingBy(snapshot -> snapshot.getGlobalId().value()));

        return snapshotsByUser.values().stream()
                .map(snapshots -> snapshots.stream()
                        .sorted(Comparator.comparing(s -> s.getCommitMetadata().getCommitDate()))
                        .toList())
                .toList();
    }

    private String extractSupplierRefId(CdoSnapshot snapshot) {
        Object supplierRef = JaversSnapshotHelper.getSnapshotProperty(snapshot, "supplier");
        return supplierRef != null ? extractReferenceId(supplierRef) : null;
    }

    // Actor Name Resolution

    private String resolveActorName(CommitMetadata commit, UUID supplierId) {
        String rawAuthor = (commit != null)
                ? JaversSnapshotHelper.resolveAuthor(commit)
                : null;

        if (rawAuthor == null || rawAuthor.isBlank()
                || "anonymousUser".equalsIgnoreCase(rawAuthor)
                || "System".equalsIgnoreCase(rawAuthor)) {
            return findActorBySupplierId(supplierId);
        }

        return rawAuthor;
    }

    private String findActorBySupplierId(UUID supplierId) {
        return findFullNameBySupplierIdFromDb(supplierId)
                .orElse("System");
    }

    /**
     * Fallback: resolves full name by querying the UserRepository for the supplier's main user.
     */
    private Optional<String> findFullNameBySupplierIdFromDb(UUID supplierId) {

        return userRepository.findBySupplierIdAndRole_Name(supplierId, Role.ROLE_SUPPLIER)
                .filter(user -> isValidName(user.getFirstName(), user.getLastName()))
                .map(user -> user.getFirstName() + " " + user.getLastName());
    }

    private static boolean isValidName(String firstName, String lastName) {
        return firstName != null && !firstName.isBlank()
                && lastName != null && !lastName.isBlank()
                && !PLACEHOLDER_NAME_VALUES.contains(firstName.toLowerCase())
                && !PLACEHOLDER_NAME_VALUES.contains(lastName.toLowerCase());
    }

    // Event Builders
    private AuditTimelineEventDto buildSimpleEvent(AuditEventType eventType, LocalDateTime timestamp, String author) {
        return AuditTimelineEventDto.builder()
                .eventType(eventType)
                .timestamp(timestamp)
                .actorName(author)
                .changes(Collections.emptyList())
                .build();
    }

    private AuditTimelineEventDto buildEditEvent(LocalDateTime timestamp, String author,
                                                 List<AuditPropertyChangeDto> changes) {
        return AuditTimelineEventDto.builder()
                .eventType(AuditEventType.INFORMATION_EDITED)
                .timestamp(timestamp)
                .actorName(author)
                .changes(changes)
                .build();
    }

    private Optional<AuditTimelineEventDto> buildEditEventIfChanged(CdoSnapshot previous, CdoSnapshot current,
                                                                    LocalDateTime timestamp, String author,
                                                                    Set<String> ignoredProperties) {
        List<AuditPropertyChangeDto> changes = JaversSnapshotHelper.computeChanges(
                previous, current, ignoredProperties);

        return changes.isEmpty()
                ? Optional.empty()
                : Optional.of(buildEditEvent(timestamp, author, changes));
    }

    // Snapshot Pair Iteration

    /**
     * Iterates over consecutive snapshot pairs, invoking the mapper for each (previous, current) pair.
     * The first snapshot is always passed as both previous and current on the first call.
     * Eliminates the repeated pattern of manual previousSnapshot tracking.
     */
    @FunctionalInterface
    private interface SnapshotPairMapper<T> {
        Optional<T> apply(CdoSnapshot previous, CdoSnapshot current);
    }

    private <T> List<T> iterateSnapshotPairs(List<CdoSnapshot> snapshots, SnapshotPairMapper<T> mapper) {
        if (snapshots.isEmpty()) {
            return Collections.emptyList();
        }

        List<T> results = new ArrayList<>();

        // First snapshot: previous == current (handled by mapper via INITIAL check)
        mapper.apply(snapshots.getFirst(), snapshots.getFirst()).ifPresent(results::add);

        IntStream.range(1, snapshots.size()).forEach(i ->
                mapper.apply(snapshots.get(i - 1), snapshots.get(i)).ifPresent(results::add));

        return results;
    }

    // Static Utilities

    private static final Set<String> PLACEHOLDER_NAME_VALUES = Set.of("firstname", "lastname");

    private static String extractReferenceId(Object ref) {
        if (ref instanceof InstanceId instanceId) {
            return instanceId.getCdoId().toString();
        }
        return ref.toString();
    }

    private static boolean isWithinSeconds(LocalDateTime a, LocalDateTime b, long thresholdSeconds) {
        return Math.abs(Duration.between(a, b).toSeconds()) <= thresholdSeconds;
    }

    // Merge consecutive APPLICATION_APPROVED_WITH_EDITS and INFORMATION_EDITED by the same author into one APPLICATION_APPROVED_WITH_EDITS
    private void mergeConsecutiveApprovalWithEditsAndInfoEditedBySameAuthor(List<AuditTimelineEventDto> events) {
        if (events.size() < 2) return;
        List<AuditTimelineEventDto> merged = new ArrayList<>();
        int i = 0;
        while (i < events.size()) {
            AuditTimelineEventDto current = events.get(i);
            if (i + 1 < events.size()) {

                AuditTimelineEventDto next = events.get(i + 1);
                if (current.eventType() == AuditEventType.APPLICATION_APPROVED_WITH_EDITS
                        && next.eventType() == AuditEventType.INFORMATION_EDITED
                        && Objects.equals(current.actorName(), next.actorName())) {

                    // Merge changes, keep timestamp of APPLICATION_APPROVED_WITH_EDITS
                    List<AuditPropertyChangeDto> mergedChanges = new ArrayList<>(current.changes());

                    mergedChanges.addAll(next.changes());
                    merged.add(AuditTimelineEventDto.builder()
                            .eventType(AuditEventType.APPLICATION_APPROVED_WITH_EDITS)
                            .timestamp(current.timestamp())
                            .actorName(current.actorName())
                            .changes(mergedChanges)
                            .build());
                    i += 2;
                    continue;

                }
            }
            merged.add(current);
            i++;
        }

        events.clear();
        events.addAll(merged);
    }
}
