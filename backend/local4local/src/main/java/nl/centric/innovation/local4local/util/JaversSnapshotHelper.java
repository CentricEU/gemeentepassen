package nl.centric.innovation.local4local.util;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.AuditPropertyChangeDto;
import org.javers.core.Javers;
import org.javers.core.commit.CommitMetadata;
import org.javers.core.metamodel.object.CdoSnapshot;
import org.javers.core.metamodel.object.InstanceId;
import org.javers.repository.jql.QueryBuilder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.UnaryOperator;

import static nl.centric.innovation.local4local.util.Constants.NOT_AVAILABLE;

/**
 * Utility component for common Javers snapshot operations:
 * retrieval, property access, formatting, and change computation.
 */
@Component
@RequiredArgsConstructor
public class JaversSnapshotHelper {

    private static final String SYSTEM_AUTHOR = "System";
    private static final String UNKNOWN_AUTHOR = "unknown";
    private static final int DEFAULT_SNAPSHOT_LIMIT = 500;

    private final Javers javers;

    // ======================== Snapshot Retrieval ========================

    /**
     * Retrieves snapshots for a given entity instance in chronological order (oldest first).
     */
    public List<CdoSnapshot> getSnapshots(Object instanceId, Class<?> entityClass) {
        List<CdoSnapshot> snapshots = new ArrayList<>(
                javers.findSnapshots(QueryBuilder.byInstanceId(instanceId, entityClass).build())
        );
        Collections.reverse(snapshots);
        return snapshots;
    }

    /**
     * Retrieves all snapshots for a given entity class (newest first — Javers default).
     */
    public List<CdoSnapshot> getSnapshots(Class<?> entityClass) {
        return javers.findSnapshots(
                QueryBuilder.byClass(entityClass).limit(DEFAULT_SNAPSHOT_LIMIT).build()
        );
    }

    // ======================== Change Computation ========================

    /**
     * Computes property-level changes between two consecutive snapshots,
     * using the raw camelCase property name as the change identifier.
     */
    public static List<AuditPropertyChangeDto> computeChanges(CdoSnapshot previous, CdoSnapshot current,
                                                              Set<String> ignoredProperties) {
        return computeChanges(previous, current, ignoredProperties, UnaryOperator.identity());
    }

    /**
     * Computes property-level changes between two consecutive snapshots,
     * applying a name transformer to each property name (e.g. day-prefixing for working hours).
     */
    public static List<AuditPropertyChangeDto> computeChanges(CdoSnapshot previous, CdoSnapshot current,
                                                              Set<String> ignoredProperties,
                                                              UnaryOperator<String> nameTransformer) {
        if (previous == null) {
            return Collections.emptyList();
        }

        return current.getState().getPropertyNames().stream()
                .filter(property -> !ignoredProperties.contains(property))
                .filter(property -> hasValueChanged(previous, current, property))
                .map(property -> toPropertyChange(previous, current, property, nameTransformer))
                .toList();
    }

    // ======================== Property Access ========================

    /**
     * Safely retrieves a property value from a Javers CdoSnapshot.
     */
    public static Object getSnapshotProperty(CdoSnapshot snapshot, String property) {
        if (snapshot == null || !snapshot.getState().getPropertyNames().contains(property)) {
            return null;
        }
        return snapshot.getPropertyValue(property);
    }

    /**
     * Safely retrieves a property value as a String.
     */
    public static String getPropertyAsString(CdoSnapshot snapshot, String property) {
        Object value = getSnapshotProperty(snapshot, property);
        return value != null ? value.toString() : null;
    }

    // ======================== Author Resolution ========================

    /**
     * Resolves the author name from Javers commit metadata.
     * Falls back to "System" if the author is unknown or empty.
     */
    public static String resolveAuthor(CommitMetadata commit) {
        String author = commit.getAuthor();
        boolean isUnresolvable = author == null || author.isBlank() || UNKNOWN_AUTHOR.equalsIgnoreCase(author);
        return isUnresolvable ? SYSTEM_AUTHOR : author;
    }

    // ======================== Boolean Helpers ========================

    /**
     * Checks if a snapshot property value is falsy (null, false, or "false").
     */
    public static boolean isFalsy(Object value) {
        return !isTruthy(value);
    }

    /**
     * Checks if a snapshot property value is truthy (true or "true").
     */
    public static boolean isTruthy(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        return value != null && "true".equalsIgnoreCase(value.toString());
    }

    // ======================== Value Formatting ========================

    /**
     * Formats a property value for display.
     * Handles nulls, Javers InstanceId references, and value-object maps.
     */
    public static String formatValue(Object value) {
        return switch (value) {
            case null -> NOT_AVAILABLE;
            case InstanceId instanceId -> instanceId.getCdoId().toString();
            case Map<?, ?> map -> formatMapValue(map);
            default -> value.toString();
        };

    }

    // ======================== Private Helpers ========================

    private static boolean hasValueChanged(CdoSnapshot previous, CdoSnapshot current, String property) {
        Object oldValue = getSnapshotProperty(previous, property);
        Object newValue = getSnapshotProperty(current, property);
        return !Objects.equals(oldValue, newValue);
    }

    private static AuditPropertyChangeDto toPropertyChange(
            CdoSnapshot previous,
            CdoSnapshot current,
            String property,
            UnaryOperator<String> nameTransformer
    ) {
        if ("logo".equals(property)) {
            return AuditPropertyChangeDto.builder()
                    .propertyName(nameTransformer.apply(property))
                    .oldValue(NOT_AVAILABLE)
                    .newValue(NOT_AVAILABLE)
                    .build();
        }

        return AuditPropertyChangeDto.builder()
                .propertyName(nameTransformer.apply(property))
                .oldValue(formatValue(getSnapshotProperty(previous, property)))
                .newValue(formatValue(getSnapshotProperty(current, property)))
                .build();
    }

    private static String formatMapValue(Map<?, ?> map) {
        Object id = map.get("id");
        if (id == null) {
            return map.toString();
        }
        Object label = findLabelInMap(map);
        return label != null ? label.toString() : id.toString();
    }

    static Object findLabelInMap(Map<?, ?> map) {
        return map.entrySet().stream()
                .filter(e -> {
                    String key = e.getKey().toString().toLowerCase();
                    return key.contains("label") || key.contains("name");
                })
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);
    }
}
