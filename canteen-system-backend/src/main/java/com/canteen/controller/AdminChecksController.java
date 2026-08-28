package com.canteen.controller;

import com.canteen.dto.ApiResponse;
import com.canteen.service.LowBalanceAlertService;
import com.canteen.service.LowStockAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/checks")
public class AdminChecksController {

    @Autowired
    private LowBalanceAlertService lowBalanceAlertService;
 	
    @Autowired
    private LowStockAlertService lowStockAlertService;

    @PostMapping("/run-all") 		
    public ResponseEntity<ApiResponse<String>> runAll() {
        lowBalanceAlertService.checkAndSendAlerts();
        lowStockAlertService.checkAndSendAlerts();
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Balance and stock checks completed", "OK"));
    }
}	