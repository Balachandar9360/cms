package com.canteen.service;

import com.canteen.dto.StatementResultDto;
import com.canteen.entity.*;
import com.canteen.exception.ResourceNotFoundException;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatementService {

    private final StudentRepository studentRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final StatementPdfService pdfService;
    private final EmailService emailService;

    public byte[] buildStatementPdf(String studentId, YearMonth month) throws Exception {
        Student student = findStudent(studentId);

        List<WalletTransaction> monthTxns = walletTransactionRepository
                .findByStudent_StudentIdOrderByCreatedAtDesc(studentId, Pageable.unpaged())
                .stream()
                .filter(t -> YearMonth.from(t.getCreatedAt()).equals(month))
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .toList();

        BigDecimal totalCredits = monthTxns.stream()
                .filter(t -> t.getTransactionType() == WalletTransaction.TransactionType.CREDIT)
                .map(WalletTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDebits = monthTxns.stream()
                .filter(t -> t.getTransactionType() == WalletTransaction.TransactionType.DEBIT)
                .map(WalletTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal openingBalance = monthTxns.isEmpty()
                ? walletRepository.findByStudent_StudentId(studentId).map(Wallet::getCurrentBalance).orElse(BigDecimal.ZERO)
                : monthTxns.get(0).getPreviousBalance();

        BigDecimal closingBalance = monthTxns.isEmpty()
                ? openingBalance
                : monthTxns.get(monthTxns.size() - 1).getNewBalance();

        return pdfService.generateStatement(student, month, openingBalance, closingBalance,
                totalCredits, totalDebits, monthTxns);
    }

    public StatementResultDto sendStatement(String studentId, YearMonth month) {
        Student student;
        try {
            student = findStudent(studentId);
        } catch (ResourceNotFoundException e) {
            return StatementResultDto.builder().studentId(studentId).studentName(studentId)
                    .status("FAILED").message("Student not found").build();
        }

        if (student.getEmail() == null || student.getEmail().isBlank()) {
            return StatementResultDto.builder().studentId(studentId).studentName(student.getName())
                    .status("FAILED").message("No email on file").build();
        }

        try {
            byte[] pdf = buildStatementPdf(studentId, month);
            emailService.sendStatementEmail(student, month.toString(), pdf);
            return StatementResultDto.builder().studentId(studentId).studentName(student.getName())
                    .status("SUCCESS").message("Statement sent").build();
        } catch (Exception e) {
            return StatementResultDto.builder().studentId(studentId).studentName(student.getName())
                    .status("FAILED").message(e.getMessage()).build();
        }
    }

    public List<StatementResultDto> sendAllForMonth(YearMonth month) {
        List<Student> activeStudents = studentRepository.findAll().stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()))
                .toList();

        return activeStudents.stream()
                .map(s -> sendStatement(s.getStudentId(), month))
                .toList();
    }

    private Student findStudent(String studentId) {
        return studentRepository.findAll().stream()
                .filter(s -> studentId.equals(s.getStudentId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
    }
}