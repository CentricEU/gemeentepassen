package nl.centric.innovation.local4local.config;

import lombok.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("acceptance")
public class CORSConfigurationAcceptance implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedOrigins("https://supplier.acceptance.gemeentepassen.eu/",
                        "https://municipality.acceptance.gemeentepassen.eu/")
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true)
                .allowedHeaders("*");
    }
}
