package com.canteen.controller;

import com.canteen.dto.ApiResponse;
import com.canteen.dto.LowBalanceWalletDto;
import com.canteen.entity.EmailLog;
import com.canteen.repository.EmailLogRepository;
import com.canteen.repository.WalletRepository;
import com.canteen.service.LowBalanceAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/wallet")
public class WalletAdminController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Autowired
    private LowBalanceAlertService lowBalanceAlertService;

    @Value("${canteen.wallet.low-balance-threshold}")
    private BigDecimal threshold;

    @GetMapping("/low-balance")
    public ResponseEntity<ApiResponse<List<LowBalanceWalletDto>>> getLowBalanceWallets() {
        List<LowBalanceWalletDto> result = walletRepository
                .findLowBalanceWalletsWithStudent(threshold)
                .stream().map(LowBalanceWalletDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Low balance wallets retrieved", result));
    }

    @GetMapping("/alert-logs")
    public ResponseEntity<ApiResponse<List<EmailLog>>> getBalanceAlertLogs() {
        List<EmailLog> logs = emailLogRepository.findTop50ByEmailTypeOrderBySentAtDesc("LOW_BALANCE_ALERT");
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Alert logs retrieved", logs));
    }

    @PostMapping("/check-low-balance")
    public ResponseEntity<ApiResponse<String>> checkLowBalance() {
        lowBalanceAlertService.checkAndSendAlerts();
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Low balance check completed", "OK"));
    }
}