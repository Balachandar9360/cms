package com.canteen.service;

import com.canteen.dto.ChangePasswordRequest;
import com.canteen.dto.LoginRequest;
import com.canteen.dto.LoginResponse;
import com.canteen.entity.Student;
import com.canteen.entity.User;
import com.canteen.exception.UnauthorizedException;
import com.canteen.repository.StudentRepository;
import com.canteen.repository.UserRepository;
import com.canteen.security.CustomUserDetails;
import com.canteen.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        User user = principal.getUser();
        String token = jwtUtil.generateToken(authentication);

        String role = user.getRole().getRoleName();
        String name;
        String studentId = null;

        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByUser_Username(user.getUsername())
                    .orElseThrow(() -> new UnauthorizedException("Student profile not found"));
            name = student.getName();
            studentId = student.getStudentId();
        } else {
            name = user.getUsername();
        }

        return LoginResponse.builder()
                .token(token)
                .user(LoginResponse.UserInfo.builder()
                        .userId(user.getId())
                        .studentId(studentId)
                        .name(name)
                        .role(role)
                        .build())
                .build();
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);
    }
}
