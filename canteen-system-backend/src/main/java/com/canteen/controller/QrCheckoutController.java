package com.canteen.controller;

import com.canteen.dto.*;
import com.canteen.entity.Student;
import com.canteen.entity.Wallet;
import com.canteen.repository.StudentRepository;
import com.canteen.repository.WalletRepository;
import com.canteen.security.JwtUtil;
import com.canteen.security.UsedQrTokenStore;
import com.canteen.service.PurchaseService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
public class QrCheckoutController {

    private final JwtUtil jwtUtil;
    private final UsedQrTokenStore usedQrTokenStore;
    private final StudentRepository studentRepository;
    private final WalletRepository walletRepository;
    private final PurchaseService purchaseService; // note: com.canteen.service.PurchaseService

    // --- STUDENT: generate a fresh QR token to show at the counter ---
    @PostMapping("/api/student/wallet/qr-token")
    public ResponseEntity<ApiResponse<QrTokenResponse>> generateQrToken() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalStateException("No student profile linked to this account"));

        String token = jwtUtil.generateQrCheckoutToken(student.getStudentId());
        QrTokenResponse response = QrTokenResponse.builder()
                .token(token)
                .expiresInSeconds(90)
                .build();
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "QR token generated", response));
    }

    // --- STAFF/ADMIN: scan a QR token to preview the student before checkout ---
    @PostMapping("/api/admin/checkout/qr-preview")
    public ResponseEntity<ApiResponse<QrStudentPreviewResponse>> previewFromQr(@RequestParam String qrToken) {
        Jws<Claims> claims = parseOrThrow(qrToken);
        String studentId = claims.getBody().getSubject();

        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Wallet wallet = walletRepository.findByStudent_StudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        QrStudentPreviewResponse response = QrStudentPreviewResponse.builder()
                .studentId(student.getStudentId())
                .studentName(student.getName())
                .currentBalance(wallet.getCurrentBalance())
                .build();
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Student resolved", response));
    }

    // --- STAFF/ADMIN: complete the purchase using the scanned token ---
    @PostMapping("/api/admin/checkout/qr-purchase")
    public ResponseEntity<ApiResponse<PurchaseResponse>> purchaseWithQr(@RequestBody QrPurchaseRequest request) {
        Jws<Claims> claims = parseOrThrow(request.getQrToken());
        String jti = claims.getBody().getId();
        long expiry = claims.getBody().getExpiration().getTime();

        if (!usedQrTokenStore.markUsedIfNew(jti, expiry)) {
            throw new IllegalStateException("This QR code has already been used");
        }

        String studentId = claims.getBody().getSubject();

        PurchaseRequest purchaseRequest = new PurchaseRequest();
        purchaseRequest.setItems(request.getItems());

        PurchaseResponse response = purchaseService.purchase(studentId, purchaseRequest);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Purchase completed", response));
    }

    private Jws<Claims> parseOrThrow(String token) {
        try {
            return jwtUtil.parseQrCheckoutToken(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("QR code is invalid or expired. Ask the student to refresh it.");
        }
    }
}