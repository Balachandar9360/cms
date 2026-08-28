package com.canteen.dto;

import com.canteen.entity.Wallet;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder
public class LowBalanceWalletDto {
    private Long walletId;
    private Long studentId;
    private String studentCode;
    private String studentName;
    private String email;
    private BigDecimal currentBalance;

    public static LowBalanceWalletDto from(Wallet w) {
        return LowBalanceWalletDto.builder()
                .walletId(w.getId())
                .studentId(w.getStudent().getId())
                .studentCode(w.getStudent().getStudentId())
                .studentName(w.getStudent().getName())
                .email(w.getStudent().getEmail())
                .currentBalance(w.getCurrentBalance())
                .build();
    }
}