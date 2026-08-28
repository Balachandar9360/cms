package com.canteen.controller;

import com.canteen.dto.ApiResponse;
import com.canteen.dto.CanteenItemDto;
import com.canteen.entity.CanteenItem;
import com.canteen.repository.CanteenItemRepository;
import com.canteen.service.LowStockAlertService;
import com.canteen.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/canteen/items")
public class CanteenItemController {

    @Autowired
    private CanteenItemRepository canteenItemRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    private LowStockAlertService lowStockAlertService;

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<CanteenItemDto>>> getLowStockItems() {
        List<CanteenItemDto> items = canteenItemRepository.findLowStockItems()
                .stream().map(CanteenItemDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Low stock items retrieved", items));
    }

    @PostMapping("/{itemId}/restock")
    public ResponseEntity<ApiResponse<CanteenItemDto>> restock(@PathVariable Long itemId,
                                                                 @RequestParam int quantity,
                                                                 @RequestParam(required = false) String reason) {
        CanteenItem item = stockService.restock(itemId, quantity, reason);
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Item restocked", CanteenItemDto.from(item)));
    }

    @PostMapping("/{itemId}/adjust")
    public ResponseEntity<ApiResponse<CanteenItemDto>> adjust(@PathVariable Long itemId,
                                                                @RequestParam int delta,
                                                                @RequestParam(required = false) String reason) {
        CanteenItem item = stockService.adjustStock(itemId, delta, reason);
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Stock adjusted", CanteenItemDto.from(item)));
    }

    @PostMapping("/check-low-stock")
    public ResponseEntity<ApiResponse<String>> checkLowStock() {
        lowStockAlertService.checkAndSendAlerts();
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Low stock check completed", "OK"));
    }
}