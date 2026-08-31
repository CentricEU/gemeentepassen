package nl.centric.innovation.local4local.dto;

import nl.centric.innovation.local4local.entity.Supplier;
import org.javers.core.metamodel.object.CdoSnapshot;

import java.util.List;
import java.util.UUID;

public record TimelineContext(
        Supplier supplier,
        UUID supplierId,
        List<CdoSnapshot> allUserSnapshots,
        List<CdoSnapshot> supplierSnapshots,
        List<CdoSnapshot> profileSnapshots
) {}
