package nl.centric.innovation.local4local.config;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.authentication.JwtAuthenticationFilter;
import nl.centric.innovation.local4local.authentication.L4LAuthenticationEntryPoint;
import nl.centric.innovation.local4local.authentication.LogoutSuccessHandler;
import nl.centric.innovation.local4local.authentication.DisabledRequestsFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
@RequiredArgsConstructor
@ComponentScan()
public class SecurityConfig {

    private final L4LAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private final UserDetailsService userDetailsService;

    private final LogoutSuccessHandler logoutSuccessHandler;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors().and()
                .authorizeHttpRequests(auth -> auth.antMatchers("/api").authenticated())
                .headers(headers -> headers
                        .xssProtection(xss -> xss.block(true))
                        .contentSecurityPolicy(csp -> csp.policyDirectives("script-src 'self'"))
                )
                .exceptionHandling(exceptionHandlingConfigurer -> exceptionHandlingConfigurer
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .logout(logout -> logout.logoutRequestMatcher(new AntPathRequestMatcher("/logout", "POST"))
                        .logoutSuccessHandler(logoutSuccessHandler))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new DisabledRequestsFilter(), JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {

        return web -> web.ignoring().antMatchers("/authenticate");
    }

    @Bean
    public L4LAuthenticationEntryPoint authenticationEntryPoint() {
        return new L4LAuthenticationEntryPoint();
    }

}
