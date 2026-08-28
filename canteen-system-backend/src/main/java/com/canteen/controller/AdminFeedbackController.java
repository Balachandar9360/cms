package com.canteen.controller;

import com.canteen.dto.ApiResponse;
import com.canteen.dto.FeedbackResponse;
import com.canteen.dto.ItemRatingSummaryDto;
import com.canteen.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedbackResponse>>> all(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Feedback retrieved",
                feedbackService.getAllFeedback(PageRequest.of(page, size))));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<ApiResponse<Page<FeedbackResponse>>> forItem(
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Item feedback retrieved",
                feedbackService.getFeedbackForItem(itemId, PageRequest.of(page, size))));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<List<ItemRatingSummaryDto>>> summary() {
        return ResponseEntity.ok(
            ApiResponse.success(HttpStatus.OK.value(), "Rating summary retrieved",
                feedbackService.getRatingSummary()));
    }
}