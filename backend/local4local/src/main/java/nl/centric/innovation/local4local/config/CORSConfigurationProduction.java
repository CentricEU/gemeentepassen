package nl.centric.innovation.local4local.config;

import lombok.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("production")
public class CORSConfigurationProduction implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedOrigins("https://supplier.gemeentepassen.eu/",
                        "https://municipality.gemeentepassen.eu/",
                        "https://citizen.gemeentepassen.eu")
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true)
                .allowedHeaders("*");
    }
}
