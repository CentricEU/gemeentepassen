package nl.centric.innovation.local4local.config;

import lombok.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("local")
public class CORSConfigurationLocal implements  WebMvcConfigurer {
		@Override
		public void addCorsMappings(@NonNull CorsRegistry registry) {
			registry.addMapping("/**").allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
					.allowedOrigins("http://localhost:4200","http://localhost:4201")
					.exposedHeaders("Set-Cookie")
					.allowCredentials(true)
					.allowedHeaders("*");
		}
}
