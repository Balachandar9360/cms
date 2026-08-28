package com.canteen.service;

import com.canteen.dto.AllocationResultDto;
import com.canteen.dto.BulkAllocationSummaryDto;
import com.canteen.entity.MonthlyWalletAllocation;
import com.canteen.entity.Student;
import com.canteen.repository.MonthlyWalletAllocationRepository;
import com.canteen.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

/**
 * On-demand version of what MonthlyAllocationScheduler runs automatically
 * on the 1st of the month. Reuses WalletService.processMonthlyAllocation
 * per student — same idempotent guard, same per-student transaction
 * boundary — but returns a summary instead of just logging.
 */
@Service
@RequiredArgsConstructor
public class BulkAllocationService {

    private final StudentRepository studentRepository;
    private final WalletService walletService;
    private final MonthlyWalletAllocationRepository allocationRepository;

    public BulkAllocationSummaryDto runForAllActiveStudents(YearMonth month) {
        List<Student> activeStudents = studentRepository.findAll().stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()))
                .toList();

        List<AllocationResultDto> results = new ArrayList<>();
        int success = 0, skipped = 0, failed = 0;

        for (Student student : activeStudents) {
            String studentId = student.getStudentId();
            boolean alreadyDone = allocationRepository
                    .existsByStudent_StudentIdAndAllocationMonth(studentId, month);

            try {
                walletService.processMonthlyAllocation(studentId, month);

                if (alreadyDone) {
                    skipped++;
                    results.add(AllocationResultDto.builder()
                            .studentId(studentId).studentName(student.getName())
                            .status("SKIPPED").creditAmount(java.math.BigDecimal.ZERO)
                            .message("Already allocated for " + month)
                            .build());
                } else {
                    MonthlyWalletAllocation record = allocationRepository
                            .findByStudent_StudentIdAndAllocationMonth(studentId, month)
                            .orElse(null);
                    success++;
                    results.add(AllocationResultDto.builder()
                            .studentId(studentId).studentName(student.getName())
                            .status("SUCCESS")
                            .creditAmount(record != null ? record.getCreditAmount() : java.math.BigDecimal.ZERO)
                            .message("Allocated successfully")
                            .build());
                }
            } catch (Exception ex) {
                failed++;
                results.add(AllocationResultDto.builder()
                        .studentId(studentId).studentName(student.getName())
                        .status("FAILED").creditAmount(java.math.BigDecimal.ZERO)
                        .message(ex.getMessage())
                        .build());
            }
        }

        return BulkAllocationSummaryDto.builder()
                .month(month.toString())
                .totalStudents(activeStudents.size())
                .successCount(success)
                .skippedCount(skipped)
                .failedCount(failed)
                .results(results)
                .build();
    }
}