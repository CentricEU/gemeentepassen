package nl.centric.innovation.local4local.config;

import lombok.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("development")
public class CORSConfigurationTesting implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedOrigins("https://d3h34u7kjg3t4s.cloudfront.net",
                        "https://d2a0blilrck94b.cloudfront.net",
                        "https://supplier.testing.gemeentepassen.eu",
                        "https://municipality.testing.gemeentepassen.eu",
                        "https://citizen.testing.gemeentepassen.eu")
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true)
                .allowedHeaders("*");
    }
}
