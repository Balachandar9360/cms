package com.canteen.controller;

import com.canteen.dto.ApiResponse;
import com.canteen.dto.CanteenItemRequest;
import com.canteen.entity.CanteenItem;
import com.canteen.service.CanteenItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/admin/canteen/items")
@RequiredArgsConstructor
public class AdminCanteenController {

    private final CanteenItemService canteenItemService;

    @PostMapping
    public ApiResponse<CanteenItem> create(@Valid @RequestBody CanteenItemRequest request) {
        return ApiResponse.success(201, "Canteen item created", canteenItemService.createItem(request));
    }

    @GetMapping
    public ApiResponse<List<CanteenItem>> list() {
        return ApiResponse.success(200, "Items fetched", canteenItemService.getAllItems());
    }

    @PutMapping("/{id}")
    public ApiResponse<CanteenItem> update(@PathVariable Long id, @Valid @RequestBody CanteenItemRequest request) {
        return ApiResponse.success(200, "Item updated", canteenItemService.updateItem(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<Void> setStatus(@PathVariable Long id, @RequestParam boolean active) {
        canteenItemService.setActiveStatus(id, active);
        return ApiResponse.success(200, active ? "Item activated" : "Item deactivated", null);
    }
}
