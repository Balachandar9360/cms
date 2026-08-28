package com.canteen.service;

import com.canteen.dto.StudentRegisterRequest;
import com.canteen.dto.StudentResponse;
import com.canteen.entity.Role;
import com.canteen.entity.Student;
import com.canteen.entity.User;
import com.canteen.exception.DuplicateResourceException;
import com.canteen.exception.ResourceNotFoundException;
import com.canteen.repository.RoleRepository;
import com.canteen.repository.StudentRepository;
import com.canteen.repository.UserRepository;
import com.canteen.util.PasswordGenerator;
import com.canteen.util.StudentIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentIdGenerator studentIdGenerator;
    private final PasswordGenerator passwordGenerator;
    private final WalletService walletService;
    private final EmailService emailService;

    /**
     * Full registration flow (section 4 of the spec):
     * create student -> generate ID -> create user+role -> create wallet -> send welcome email.
     */
    @Transactional
    public StudentResponse registerStudent(StudentRegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A student with this email already exists");
        }
        if (studentRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("A student with this registration number already exists");
        }

        String studentId = studentIdGenerator.generate();
        String tempPassword = passwordGenerator.generate();

        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT role not configured"));

        User user = User.builder()
                .username(studentId) // username = Student ID
                .password(passwordEncoder.encode(tempPassword)) // only the hash is stored
                .role(studentRole)
                .activeStatus(true)
                .firstLogin(true)
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .studentId(studentId)
                .registrationNumber(request.getRegistrationNumber())
                .user(user)
                .name(request.getName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .department(request.getDepartment())
                .course(request.getCourse())
                .year(request.getYear())
                .semester(request.getSemester())
                .address(request.getAddress())
                .joiningDate(request.getJoiningDate())
                .status("ACTIVE")
                .build();
        student = studentRepository.save(student);

        walletService.createWalletForStudent(student);
        walletService.processInitialAllocation(student);  

        // Registration succeeds even if the email fails to send (see spec section 5)
        emailService.sendWelcomeEmail(student, studentId, tempPassword);

        return toResponse(student);
    }

    public Page<StudentResponse> searchStudents(String keyword, Pageable pageable) {
        String q = keyword == null ? "" : keyword;
        return studentRepository
                .findByNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(q, q, pageable)
                .map(this::toResponse);
    }

    public StudentResponse getStudent(String studentId) {
        return toResponse(findByStudentId(studentId));
    }

    public Student findByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
    }

    @Transactional
    public void setActiveStatus(String studentId, boolean active) {
        Student student = findByStudentId(studentId);
        student.setStatus(active ? "ACTIVE" : "INACTIVE");
        student.getUser().setActiveStatus(active);
        studentRepository.save(student);
        userRepository.save(student.getUser());
    }

    @Transactional
    public String resetPassword(String studentId) {
        Student student = findByStudentId(studentId);
        String newPassword = passwordGenerator.generate();
        User user = student.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(true);
        userRepository.save(user);
        emailService.sendCredentialResendEmail(student, user.getUsername(), newPassword);
        return newPassword; // returned once to Admin only, never logged
    }

    public void resendCredentials(String studentId) {
        // Generates a fresh temporary password and re-sends it, in case the original email failed
        resetPassword(studentId);
    }

    private StudentResponse toResponse(Student s) {
        return StudentResponse.builder()
                .id(s.getId())
                .studentId(s.getStudentId())
                .registrationNumber(s.getRegistrationNumber())
                .name(s.getName())
                .email(s.getEmail())
                .mobile(s.getMobile())
                .dateOfBirth(s.getDateOfBirth())
                .gender(s.getGender())
                .department(s.getDepartment())
                .course(s.getCourse())
                .year(s.getYear())
                .semester(s.getSemester())
                .address(s.getAddress())
                .joiningDate(s.getJoiningDate())
                .status(s.getStatus())
                .build();
    }
}
