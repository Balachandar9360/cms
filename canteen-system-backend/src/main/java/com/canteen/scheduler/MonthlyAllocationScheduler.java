package com.canteen.scheduler;

import com.canteen.entity.Student;
import com.canteen.repository.StudentRepository;
import com.canteen.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.YearMonth;
import java.util.List;

// Runs at 00:05 on the 1st of every month and credits every active student's wallet.
// Each student is processed independently so one failure never blocks the rest,
// and the unique (student_id, allocation_month) constraint keeps this idempotent.
@Component
@RequiredArgsConstructor
public class MonthlyAllocationScheduler {

    private static final Logger log = LoggerFactory.getLogger(MonthlyAllocationScheduler.class);

    private final StudentRepository studentRepository;
    private final WalletService walletService;

    @Scheduled(cron = "0 5 0 1 * *")
    public void runMonthlyAllocation() {
        YearMonth month = YearMonth.now();
        List<Student> activeStudents = studentRepository.findAll().stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()))
                .toList();

        log.info("Starting monthly wallet allocation for {} - {} active students", month, activeStudents.size());

        int success = 0, failed = 0;
        for (Student student : activeStudents) {
            try {
                walletService.processMonthlyAllocation(student.getStudentId(), month);
                success++;
            } catch (Exception e) {
                failed++;
                log.error("Monthly allocation failed for student {}: {}", student.getStudentId(), e.getMessage());
            }
        }

        log.info("Monthly wallet allocation complete for {} - success: {}, failed: {}", month, success, failed);
    }
}
