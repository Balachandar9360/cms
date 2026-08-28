package com.canteen.util;

import com.canteen.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.Year;

// Generates unique sequential Student IDs like STU20260001
@Component
@RequiredArgsConstructor
public class StudentIdGenerator {

    private final StudentRepository studentRepository;

    public synchronized String generate() {
        int currentYear = Year.now().getValue();
        long count = studentRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("STU%d%04d", currentYear, count);
            count++;
        } while (studentRepository.findByStudentId(candidate).isPresent());
        return candidate;
    }
}
