package com.canteen.controller;

import com.canteen.dto.*;

import java.time.YearMonth;
import com.canteen.service.StudentService;
import com.canteen.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final StudentService studentService;
    private final WalletService walletService;

    @PostMapping
    public ApiResponse<StudentResponse> register(@Valid @RequestBody StudentRegisterRequest request) {
        StudentResponse response = studentService.registerStudent(request);
        return ApiResponse.success(201, "Student registered successfully", response);
    }

    @GetMapping
    public ApiResponse<Page<StudentResponse>> list(@RequestParam(required = false) String search,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.success(200, "Students fetched", studentService.searchStudents(search, pageable));
    }

    @GetMapping("/{studentId}")
    public ApiResponse<StudentResponse> get(@PathVariable String studentId) {
        return ApiResponse.success(200, "Student fetched", studentService.getStudent(studentId));
    }

    @PatchMapping("/{studentId}/status")
    public ApiResponse<Void> setStatus(@PathVariable String studentId, @RequestParam boolean active) {
        studentService.setActiveStatus(studentId, active);
        return ApiResponse.success(200, active ? "Student activated" : "Student deactivated", null);
    }

    @PostMapping("/{studentId}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable String studentId) {
        studentService.resetPassword(studentId);
        return ApiResponse.success(200, "Password reset and emailed to student", null);
    }

    @PostMapping("/{studentId}/resend-credentials")
    public ApiResponse<Void> resendCredentials(@PathVariable String studentId) {
        studentService.resendCredentials(studentId);
        return ApiResponse.success(200, "Credentials resent to student's email", null);
    }

    @GetMapping("/{studentId}/wallet")
    public ApiResponse<WalletResponse> wallet(@PathVariable String studentId) {
        return ApiResponse.success(200, "Wallet fetched", walletService.getWalletSummary(studentId));
    }
    
 // TEMPORARY - remove before production, or protect behind an admin-only guard
    @PostMapping("/{studentId}/trigger-monthly-allocation")
    public ApiResponse<Void> triggerAllocation(@PathVariable String studentId) {
        walletService.processMonthlyAllocation(studentId, java.time.YearMonth.now());
        return ApiResponse.success(200, "Monthly allocation processed", null);
    }
}
