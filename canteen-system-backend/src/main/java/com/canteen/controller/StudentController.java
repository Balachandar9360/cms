package com.canteen.controller;
import com.canteen.dto.*;
import com.canteen.entity.CanteenItem;
import com.canteen.service.CanteenItemService;
import com.canteen.service.PurchaseService;
import com.canteen.service.StudentService;
import com.canteen.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final WalletService walletService;
    private final CanteenItemService canteenItemService;
    private final PurchaseService purchaseService;

    @GetMapping("/profile")
    public ApiResponse<StudentResponse> profile(Authentication authentication) {
        return ApiResponse.success(200, "Profile fetched", studentService.getStudent(authentication.getName()));
    }

    @GetMapping("/wallet")
    public ApiResponse<WalletResponse> wallet(Authentication authentication) {
        return ApiResponse.success(200, "Wallet fetched", walletService.getWalletSummary(authentication.getName()));
    }

    @GetMapping("/transactions")
    public ApiResponse<Page<WalletTransactionResponse>> transactions(Authentication authentication,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.success(200, "Transactions fetched",
                walletService.getTransactions(authentication.getName(), pageable));
    }

    @GetMapping("/canteen/items")
    public ApiResponse<List<CanteenItem>> canteenItems() {
        return ApiResponse.success(200, "Items fetched", canteenItemService.getActiveAvailableItems());
    }

    @PostMapping("/purchases")
    public ApiResponse<PurchaseResponse> purchase(@Valid @RequestBody PurchaseRequest request, Authentication authentication) {
        PurchaseResponse response = purchaseService.purchase(authentication.getName(), request);
        return ApiResponse.success(201, "Purchase successful", response);
    }
}