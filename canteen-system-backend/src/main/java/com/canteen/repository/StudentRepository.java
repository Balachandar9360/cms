package com.canteen.repository;

import com.canteen.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByUser_Username(String username);
    boolean existsByEmail(String email);
    boolean existsByRegistrationNumber(String registrationNumber);
    long countByStatus(String status);
    Page<Student> findByNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(
            String name, String studentId, Pageable pageable);
}
