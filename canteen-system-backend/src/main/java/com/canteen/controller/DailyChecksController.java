package com.canteen.controller;

import com.canteen.service.LowBalanceAlertService;
import com.canteen.service.LowStockAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/checks")
public class DailyChecksController {

    @Autowired
    private LowBalanceAlertService lowBalanceAlertService;

    @Autowired
    private LowStockAlertService lowStockAlertService;

    @PostMapping("/run-all")
    public ResponseEntity<String> runAllChecks() {
        lowBalanceAlertService.checkAndSendAlerts();
        lowStockAlertService.checkAndSendAlerts();
        return ResponseEntity.ok("Low balance and low stock checks completed.");
    }
}