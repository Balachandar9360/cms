package com.canteen.service;

import com.canteen.dto.PurchaseRequest;
import com.canteen.dto.PurchaseResponse;
import com.canteen.entity.*;
import com.canteen.exception.InsufficientBalanceException;
import com.canteen.exception.InvalidPurchaseException;
import com.canteen.exception.ResourceNotFoundException;
import com.canteen.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CanteenItemRepository canteenItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final StudentRepository studentRepository;
    private final StockService stockService;

    public PurchaseService(WalletRepository walletRepository,
                            WalletTransactionRepository walletTransactionRepository,
                            CanteenItemRepository canteenItemRepository,
                            PurchaseRepository purchaseRepository,
                            StudentRepository studentRepository,
                            StockService stockService) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.canteenItemRepository = canteenItemRepository;
        this.purchaseRepository = purchaseRepository;
        this.studentRepository = studentRepository;
        this.stockService = stockService;
    }

    @Transactional
    public PurchaseResponse purchase(String studentId, PurchaseRequest request) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!"ACTIVE".equals(student.getStatus())) {
            throw new InvalidPurchaseException("Student account is not active");
        }

        Wallet wallet = walletRepository.findByStudentIdForUpdate(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseItem> purchaseItems = new ArrayList<>();

        for (PurchaseRequest.PurchaseLineItem line : request.getItems()) {
            if (line.getQuantity() == null || line.getQuantity() <= 0) {
                throw new InvalidPurchaseException("Quantity must be greater than 0");
            }

            CanteenItem item = canteenItemRepository.findById(line.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Canteen item not found: " + line.getItemId()));

            if (!item.isActiveStatus() || !item.isAvailable()) {
                throw new InvalidPurchaseException("Item is not available: " + item.getItemName());
            }

            if (item.getStockQuantity() < line.getQuantity()) {
                throw new InvalidPurchaseException(
                    "Insufficient stock for " + item.getItemName() + ". Available: " + item.getStockQuantity());
            }

            BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            total = total.add(lineTotal);

            purchaseItems.add(PurchaseItem.builder()
                    .item(item)
                    .quantity(line.getQuantity())
                    .unitPrice(item.getPrice())
                    .totalPrice(lineTotal)
                    .build());
        }

        BigDecimal previousBalance = wallet.getCurrentBalance();

        if (previousBalance.compareTo(total) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance. Current balance is " + previousBalance + " but purchase requires " + total);
        }

        BigDecimal newBalance = previousBalance.subtract(total);
        wallet.setCurrentBalance(newBalance);
        walletRepository.save(wallet);

        String purchaseNumber = "PUR" + Year.now().getValue() + System.currentTimeMillis();

        Purchase purchase = Purchase.builder()
                .student(student)
                .purchaseNumber(purchaseNumber)
                .totalAmount(total)
                .previousBalance(previousBalance)
                .newBalance(newBalance)
                .status("SUCCESS")
                .build();

        purchaseItems.forEach(pi -> pi.setPurchase(purchase));
        purchase.setItems(purchaseItems);
        Purchase savedPurchase = purchaseRepository.save(purchase);

        walletTransactionRepository.save(WalletTransaction.builder()
                .wallet(wallet)
                .student(student)
                .transactionType(WalletTransaction.TransactionType.DEBIT)
                .amount(total)
                .previousBalance(previousBalance)
                .newBalance(newBalance)
                .referenceType("PURCHASE")
                .referenceId(savedPurchase.getId())
                .description("Canteen purchase " + purchaseNumber)
                .createdBy(studentId)
                .build());

        // Deduct stock for each line now that wallet debit succeeded
        for (PurchaseItem pi : purchaseItems) {
            stockService.deductStock(pi.getItem().getId(), pi.getQuantity());
        }

        return toResponse(savedPurchase);
    }

    private PurchaseResponse toResponse(Purchase p) {
        return PurchaseResponse.builder()
                .id(p.getId())
                .purchaseNumber(p.getPurchaseNumber())
                .totalAmount(p.getTotalAmount())
                .previousBalance(p.getPreviousBalance())
                .newBalance(p.getNewBalance())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .items(p.getItems().stream()
                        .map(pi -> PurchaseResponse.PurchaseItemResponse.builder()
                                .itemId(pi.getItem().getId())
                                .itemName(pi.getItem().getItemName())
                                .quantity(pi.getQuantity())
                                .unitPrice(pi.getUnitPrice())
                                .totalPrice(pi.getTotalPrice())
                                .build())
                        .toList())
                .build();
    }
}