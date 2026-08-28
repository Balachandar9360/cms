package com.canteen.service;

import com.canteen.dto.CanteenItemRequest;
import com.canteen.entity.CanteenItem;
import com.canteen.exception.ResourceNotFoundException;
import com.canteen.repository.CanteenItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class CanteenItemService {

    private final CanteenItemRepository canteenItemRepository;

    public List<CanteenItem> getAllItems() {
        return canteenItemRepository.findAll();
    }

    public List<CanteenItem> getActiveAvailableItems() {
        return canteenItemRepository.findByActiveStatusTrueAndAvailableTrue();
    }

    public CanteenItem createItem(CanteenItemRequest request) {
        String itemCode = "ITM" + Year.now().getValue() + String.format("%04d", canteenItemRepository.count() + 1);
        CanteenItem item = CanteenItem.builder()
                .itemCode(itemCode)
                .itemName(request.getItemName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .available(request.isAvailable())
                .activeStatus(true)
                .build();
        return canteenItemRepository.save(item);
    }

    public CanteenItem updateItem(Long id, CanteenItemRequest request) {
        CanteenItem item = getById(id);
        item.setItemName(request.getItemName());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setAvailable(request.isAvailable());
        return canteenItemRepository.save(item);
    }

    public void setActiveStatus(Long id, boolean active) {
        CanteenItem item = getById(id);
        item.setActiveStatus(active);
        canteenItemRepository.save(item);
    }

    public CanteenItem getById(Long id) {
        return canteenItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen item not found: " + id));
    }
}
