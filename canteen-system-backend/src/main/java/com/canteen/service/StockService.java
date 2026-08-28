package com.canteen.service;

import com.canteen.entity.CanteenItem;
import com.canteen.entity.StockMovement;
import com.canteen.repository.CanteenItemRepository;
import com.canteen.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class StockService {

    @Autowired
    private CanteenItemRepository canteenItemRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    /**
     * Deducts stock on a sale. Throws if insufficient stock.
     * Call this from your purchase/checkout flow, per item, per quantity sold.
     */
    @Transactional
    public void deductStock(Long itemId, int quantitySold) {
        CanteenItem item = canteenItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        if (item.getStockQuantity() < quantitySold) {
            throw new IllegalStateException(
                "Insufficient stock for '" + item.getItemName() + "'. Available: "
                + item.getStockQuantity() + ", requested: " + quantitySold);
        }

        int before = item.getStockQuantity();
        int after = before - quantitySold;
        item.setStockQuantity(after);
        canteenItemRepository.save(item);

        logMovement(item, "SALE", -quantitySold, before, after, "Checkout deduction");
    }

    /**
     * Adds stock (restocking).
     */
    @Transactional
    public CanteenItem restock(Long itemId, int quantity, String reason) {
        CanteenItem item = canteenItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        int before = item.getStockQuantity();
        int after = before + quantity;
        item.setStockQuantity(after);
        canteenItemRepository.save(item);

        logMovement(item, "RESTOCK", quantity, before, after, reason);
        return item;
    }

    /**
     * Manual correction — can be positive or negative (e.g. wastage, miscount).
     */
    @Transactional
    public CanteenItem adjustStock(Long itemId, int delta, String reason) {
        CanteenItem item = canteenItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        int before = item.getStockQuantity();
        int after = before + delta;

        if (after < 0) {
            throw new IllegalStateException("Adjustment would result in negative stock.");
        }

        item.setStockQuantity(after);
        canteenItemRepository.save(item);

        String movementType = delta < 0 ? "WASTAGE" : "ADJUSTMENT";
        logMovement(item, movementType, delta, before, after, reason);
        return item;
    }

    private void logMovement(CanteenItem item, String type, int quantity,
                              int before, int after, String reason) {
        String performedBy = "SYSTEM";
        try {
            performedBy = SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception ignored) {}

        StockMovement movement = StockMovement.builder()
                .item(item)
                .movementType(type)
                .quantity(quantity)
                .quantityBefore(before)
                .quantityAfter(after)
                .reason(reason)
                .performedBy(performedBy)
                .build();

        stockMovementRepository.save(movement);
    }
}