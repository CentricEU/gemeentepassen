package nl.centric.innovation.local4local.config;

import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.javers.spring.auditable.AuthorProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JaversConfig {

    @Bean
    public AuthorProvider authorProvider(PrincipalService principalService) {
        return () -> {
            try {
                return principalService.getUserFullName();
            } catch (Exception e) {
                return "System";
            }
        };
    }
}
