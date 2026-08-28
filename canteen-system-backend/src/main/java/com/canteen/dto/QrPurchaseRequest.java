package com.canteen.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
public class QrPurchaseRequest {
    private String qrToken;
    private List<PurchaseRequest.PurchaseLineItem> items;
}