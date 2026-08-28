package com.canteen.controller;

import com.canteen.dto.*;
import com.canteen.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SalesSummaryDto>> summary() {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Summary retrieved", analyticsService.getSummary()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<RevenuePointDto>>> revenue(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Revenue retrieved", analyticsService.getRevenueByDay(days)));
    }

    @GetMapping("/top-items")
    public ResponseEntity<ApiResponse<List<TopItemDto>>> topItems(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Top items retrieved", analyticsService.getTopItems(days, limit)));
    }

    @GetMapping("/by-category")
    public ResponseEntity<ApiResponse<List<CategorySalesDto>>> byCategory(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Category sales retrieved", analyticsService.getSalesByCategory(days)));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<ApiResponse<List<PeakHourDto>>> peakHours(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Peak hours retrieved", analyticsService.getPeakHours(days)));
    }
}