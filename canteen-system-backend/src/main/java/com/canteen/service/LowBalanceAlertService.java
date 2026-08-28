package com.canteen.service;

import com.canteen.entity.EmailLog;
import com.canteen.entity.Student;
import com.canteen.entity.Wallet;
import com.canteen.repository.EmailLogRepository;
import com.canteen.repository.WalletRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LowBalanceAlertService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Autowired
    private EmailService emailService;

    @Value("${canteen.wallet.low-balance-threshold}")
    private BigDecimal threshold;

    @Value("${canteen.wallet.alert-cooldown-hours}")
    private int cooldownHours;

    private static final String EMAIL_TYPE = "LOW_BALANCE_ALERT";

    @Transactional
    public void checkAndSendAlerts() {
        List<Wallet> lowWallets = walletRepository.findLowBalanceWallets(threshold);

        for (Wallet wallet : lowWallets) {
            Student student = wallet.getStudent();
            if (student == null || student.getEmail() == null) continue;

            // Skip inactive students
            if (!"ACTIVE".equalsIgnoreCase(student.getStatus())) continue;

            // Skip if already alerted within cooldown window
            LocalDateTime since = LocalDateTime.now().minusHours(cooldownHours);
            List<EmailLog> recentAlerts = emailLogRepository.findRecentAlerts(
                    student.getId(), EMAIL_TYPE, since);

            if (!recentAlerts.isEmpty()) continue;

            String toEmail = student.getEmail();
            String body = buildAlertMessage(student.getName(), wallet.getCurrentBalance());

            EmailLog log = EmailLog.builder()
                    .student(student)
                    .email(toEmail)
                    .emailType(EMAIL_TYPE)
                    .build();

            try {
                emailService.sendEmail(toEmail, "Low Wallet Balance Alert", body);
                log.setStatus("SUCCESS");
            } catch (Exception e) {
                log.setStatus("FAILED");
                log.setErrorMessage(e.getMessage());
            }

            emailLogRepository.save(log);
        }
    }

    private String buildAlertMessage(String studentName, BigDecimal balance) {
        return String.format(
            "Dear %s,%n%nYour canteen wallet balance is low: Rs.%.2f.%n" +
            "Please recharge soon to avoid interruption at checkout.%n%nThank you.",
            studentName, balance
        );
    }
}