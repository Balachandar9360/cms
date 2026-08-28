package com.canteen.controller;

import com.canteen.service.LowBalanceAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/wallet")
public class WalletAlertController {

    @Autowired
    private LowBalanceAlertService lowBalanceAlertService;

    @PostMapping("/check-low-balance")
    public ResponseEntity<String> triggerLowBalanceCheck() {
        lowBalanceAlertService.checkAndSendAlerts();
        return ResponseEntity.ok("Low balance check completed.");
    }
}