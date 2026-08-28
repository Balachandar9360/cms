package com.canteen.controller;

import com.canteen.dto.ApiResponse;
import com.canteen.dto.BulkAllocationSummaryDto;
import com.canteen.service.BulkAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/wallet")
@RequiredArgsConstructor
public class BulkAllocationController {

    private final BulkAllocationService bulkAllocationService;

    @PostMapping("/monthly-allocation/run-all")
    public ResponseEntity<ApiResponse<BulkAllocationSummaryDto>> runForAll(
            @RequestParam(required = false) String month) {
        YearMonth ym = (month != null && !month.isBlank()) ? YearMonth.parse(month) : YearMonth.now();
        BulkAllocationSummaryDto summary = bulkAllocationService.runForAllActiveStudents(ym);
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Bulk allocation completed", summary));
    }
}