package com.canteen.config;

import com.canteen.entity.Role;
import com.canteen.entity.User;
import com.canteen.repository.RoleRepository;
import com.canteen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Seeds ADMIN/STUDENT roles and one default admin user (dev convenience only)
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-admin-username:Admin}")
    private String defaultAdminUsername;

    @Value("${app.default-admin-password:Admin@123}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("ADMIN").build()));
        roleRepository.findByRoleName("STUDENT")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("STUDENT").build()));

        if (!userRepository.existsByUsername(defaultAdminUsername)) {
            userRepository.save(User.builder()
                    .username(defaultAdminUsername)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .role(adminRole)
                    .activeStatus(true)
                    .firstLogin(true)
                    .build());
        }
    }
}
