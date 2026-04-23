package nhb.vn.be.config;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.entity.Role;
import nhb.vn.be.entity.User;
import nhb.vn.be.repository.RoleRepository;
import nhb.vn.be.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Configuration
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    @ConditionalOnProperty(prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.mysql.cj.jdbc.Driver")
    public ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {
            if(roleRepository.findByRoleName("ADMIN").isEmpty()){
                log.info("Create ADMIN_ROLE");
                Role ADMIN_ROLE = Role.builder()
                        .roleName("ADMIN")
                        .description("ADMIN_ROLE")
                        .build();
                roleRepository.save(ADMIN_ROLE);
            }

            if (userRepository.findByUsername("admin").isEmpty()) {
                log.info("findByUserName");
                var roles = new HashSet<Role>();
                Role role = roleRepository.findByRoleName("ADMIN")
                    .orElseGet(() -> roleRepository.save(
                        Role.builder().roleName("ADMIN").description("ADMIN_ROLE").build()
                    ));
                roles.add(role);

                User user = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .roles(roles)
                    .build();
                userRepository.save(user);
                log.info("Admin has been created");
            }
        };
    }
}
