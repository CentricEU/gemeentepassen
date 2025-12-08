package nl.centric.innovation.local4local.security;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {

    /**
     * Registers an XSS filter to sanitize incoming requests.
     * This filter will be applied to all URL patterns.
     */
    @Bean
    public FilterRegistrationBean<XSSFilter> xssFilterRegistrationBean() {
        FilterRegistrationBean<XSSFilter> registrationBean = new FilterRegistrationBean<>();

        registrationBean.setFilter(new XSSFilter());
        registrationBean.addUrlPatterns("/*");

        return registrationBean;
    }
}
