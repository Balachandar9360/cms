package com.canteen.controller;

import com.canteen.dto.LowBalanceWalletDto;
import com.canteen.entity.EmailLog;
import com.canteen.repository.EmailLogRepository;
import com.canteen.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/wallet")
public class WalletQueryController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Value("${canteen.wallet.low-balance-threshold}")
    private BigDecimal threshold;

    @GetMapping("/low-balance")
    public ResponseEntity<List<LowBalanceWalletDto>> getLowBalanceWallets() {
        List<LowBalanceWalletDto> result = walletRepository
                .findLowBalanceWalletsWithStudent(threshold)
                .stream().map(LowBalanceWalletDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/alert-logs")
    public ResponseEntity<List<EmailLog>> getBalanceAlertLogs() {
        return ResponseEntity.ok(
            emailLogRepository.findTop50ByEmailTypeOrderBySentAtDesc("LOW_BALANCE_ALERT"));
    }
}