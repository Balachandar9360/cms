package com.canteen.controller;

import com.canteen.dto.*;
import com.canteen.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/student/feedback")
@RequiredArgsConstructor
public class StudentFeedbackController {

    private final FeedbackService feedbackService;
    private final com.canteen.repository.StudentRepository studentRepository;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<UnratedPurchaseResponse>>> pending() {
        String studentId = currentStudentId();
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Pending feedback retrieved",
                feedbackService.getUnratedPurchases(studentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackResponse>> submit(@RequestBody FeedbackRequest request) {
        String studentId = currentStudentId();
        FeedbackResponse result = feedbackService.submitFeedback(studentId, request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Feedback submitted", result));
    }

    private String currentStudentId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalStateException("No student profile linked to this account"))
                .getStudentId();
    }
}