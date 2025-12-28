package com.learning.system.config;

import com.learning.system.security.JwtAccessDeniedHandler;
import com.learning.system.security.JwtAuthenticationEntryPoint;
import com.learning.system.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/uploads/**").permitAll()
                    .requestMatchers("/api/test/email/**").permitAll()
                .requestMatchers("/api/courses/published").permitAll()
                .requestMatchers("/api/courses/**").permitAll()
                .requestMatchers("/api/users").permitAll()
                .requestMatchers("/api/modules/**").permitAll()
                .requestMatchers("/api/student-profiles/user/**").permitAll()
                .requestMatchers("/api/students/**").permitAll()
                .requestMatchers("/api/student-requests").permitAll()
                .requestMatchers("/api/student-requests/pending").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/student-requests/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/student-profiles/current").authenticated()
                .requestMatchers("/api/student-profiles/current/enroll/**").authenticated()
                .requestMatchers("/api/student-profiles/{studentId}/enroll/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/student-profiles").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/chapters/**").permitAll()
                .requestMatchers("/api/courses/{courseId}/modules/{moduleId}/chapters/free").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 