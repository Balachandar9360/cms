package com.canteen.service;

import com.canteen.dto.*;
import com.canteen.entity.ItemFeedback;
import com.canteen.entity.PurchaseItem;
import com.canteen.exception.InvalidPurchaseException;
import com.canteen.exception.ResourceNotFoundException;
import com.canteen.repository.ItemFeedbackRepository;
import com.canteen.repository.PurchaseItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final PurchaseItemRepository purchaseItemRepository;
    private final ItemFeedbackRepository feedbackRepository;

    public List<UnratedPurchaseResponse> getUnratedPurchases(String studentId) {
        return purchaseItemRepository.findUnratedByStudent(studentId).stream()
                .map(pi -> UnratedPurchaseResponse.builder()
                        .purchaseItemId(pi.getId())
                        .itemName(pi.getItem().getItemName())
                        .quantity(pi.getQuantity())
                        .purchasedAt(pi.getPurchase().getPurchasedAt())
                        .build())
                .toList();
    }

    @Transactional
    public FeedbackResponse submitFeedback(String studentId, FeedbackRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidPurchaseException("Rating must be between 1 and 5");
        }

        PurchaseItem purchaseItem = purchaseItemRepository.findById(request.getPurchaseItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase item not found"));

        if (!studentId.equals(purchaseItem.getPurchase().getStudent().getStudentId())) {
            throw new InvalidPurchaseException("This purchase does not belong to you");
        }

        if (feedbackRepository.existsByPurchaseItem_Id(purchaseItem.getId())) {
            throw new InvalidPurchaseException("You've already rated this purchase");
        }

        ItemFeedback feedback = ItemFeedback.builder()
                .student(purchaseItem.getPurchase().getStudent())
                .item(purchaseItem.getItem())
                .purchaseItem(purchaseItem)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        ItemFeedback saved = feedbackRepository.save(feedback);
        return toResponse(saved);
    }

    public Page<FeedbackResponse> getFeedbackForItem(Long itemId, Pageable pageable) {
        return feedbackRepository.findByItem_IdOrderByCreatedAtDesc(itemId, pageable).map(this::toResponse);
    }

    public Page<FeedbackResponse> getAllFeedback(Pageable pageable) {
        return feedbackRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    public List<ItemRatingSummaryDto> getRatingSummary() {
        return feedbackRepository.getRatingSummaryRaw().stream()
                .map(row -> ItemRatingSummaryDto.builder()
                        .itemId((Long) row[0])
                        .itemName((String) row[1])
                        .avgRating(BigDecimal.valueOf((Double) row[2]).setScale(2, java.math.RoundingMode.HALF_UP))
                        .ratingCount((Long) row[3])
                        .build())
                .toList();
    }

    private FeedbackResponse toResponse(ItemFeedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .studentName(f.getStudent().getName())
                .itemName(f.getItem().getItemName())
                .rating(f.getRating())
                .comment(f.getComment())
                .createdAt(f.getCreatedAt())
                .build();
    }
}