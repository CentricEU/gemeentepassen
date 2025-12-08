package nl.centric.innovation.local4local.enums;

import lombok.Getter;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

@Getter
public enum PolicyLevel {
    BASIC(Sanitizers.FORMATTING),
    EXTENDED(Sanitizers.FORMATTING.and(Sanitizers.LINKS).and(Sanitizers.IMAGES));

    final PolicyFactory policy;

    PolicyLevel(PolicyFactory policy) {
        this.policy = policy;
    }
}
