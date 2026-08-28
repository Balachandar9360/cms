package com.canteen.service;

import com.canteen.dto.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @PersistenceContext
    private EntityManager em;

    // Daily revenue for the last N days
    @SuppressWarnings("unchecked")
    public List<RevenuePointDto> getRevenueByDay(int days) {
        List<Tuple> rows = em.createNativeQuery(
                "SELECT DATE(p.purchased_at) AS label, SUM(p.total_amount) AS revenue, COUNT(*) AS orderCount " +
                "FROM purchases p " +
                "WHERE p.status = 'SUCCESS' AND p.purchased_at >= (CURDATE() - INTERVAL :days DAY) " +
                "GROUP BY DATE(p.purchased_at) " +
                "ORDER BY label ASC", Tuple.class)
                .setParameter("days", days)
                .getResultList();

        return rows.stream().map(r -> RevenuePointDto.builder()
                .label(String.valueOf(r.get("label")))
                .revenue((BigDecimal) r.get("revenue"))
                .orderCount(((Number) r.get("orderCount")).longValue())
                .build()).collect(Collectors.toList());
    }

    // Top-selling items by quantity, within the last N days
    @SuppressWarnings("unchecked")
    public List<TopItemDto> getTopItems(int days, int limit) {
        List<Tuple> rows = em.createNativeQuery(
                "SELECT ci.item_name AS itemName, ci.item_code AS itemCode, " +
                "SUM(pi.quantity) AS quantitySold, SUM(pi.total_price) AS revenue " +
                "FROM purchase_items pi " +
                "JOIN purchases p ON pi.purchase_id = p.id " +
                "JOIN canteen_items ci ON pi.item_id = ci.id " +
                "WHERE p.status = 'SUCCESS' AND p.purchased_at >= (CURDATE() - INTERVAL :days DAY) " +
                "GROUP BY ci.id, ci.item_name, ci.item_code " +
                "ORDER BY quantitySold DESC " +
                "LIMIT :limit", Tuple.class)
                .setParameter("days", days)
                .setParameter("limit", limit)
                .getResultList();

        return rows.stream().map(r -> TopItemDto.builder()
                .itemName((String) r.get("itemName"))
                .itemCode((String) r.get("itemCode"))
                .quantitySold(((Number) r.get("quantitySold")).longValue())
                .revenue((BigDecimal) r.get("revenue"))
                .build()).collect(Collectors.toList());
    }

    // Revenue grouped by item category
    @SuppressWarnings("unchecked")
    public List<CategorySalesDto> getSalesByCategory(int days) {
        List<Tuple> rows = em.createNativeQuery(
                "SELECT COALESCE(ci.category, 'Uncategorized') AS category, " +
                "SUM(pi.total_price) AS revenue, SUM(pi.quantity) AS quantitySold " +
                "FROM purchase_items pi " +
                "JOIN purchases p ON pi.purchase_id = p.id " +
                "JOIN canteen_items ci ON pi.item_id = ci.id " +
                "WHERE p.status = 'SUCCESS' AND p.purchased_at >= (CURDATE() - INTERVAL :days DAY) " +
                "GROUP BY category " +
                "ORDER BY revenue DESC", Tuple.class)
                .setParameter("days", days)
                .getResultList();

        return rows.stream().map(r -> CategorySalesDto.builder()
                .category((String) r.get("category"))
                .revenue((BigDecimal) r.get("revenue"))
                .quantitySold(((Number) r.get("quantitySold")).longValue())
                .build()).collect(Collectors.toList());
    }

    // Order count by hour of day (0-23), last N days
    @SuppressWarnings("unchecked")
    public List<PeakHourDto> getPeakHours(int days) {
        List<Tuple> rows = em.createNativeQuery(
                "SELECT HOUR(p.purchased_at) AS hour, COUNT(*) AS orderCount " +
                "FROM purchases p " +
                "WHERE p.status = 'SUCCESS' AND p.purchased_at >= (CURDATE() - INTERVAL :days DAY) " +
                "GROUP BY HOUR(p.purchased_at) " +
                "ORDER BY hour ASC", Tuple.class)
                .setParameter("days", days)
                .getResultList();

        return rows.stream().map(r -> PeakHourDto.builder()
                .hour(((Number) r.get("hour")).intValue())
                .orderCount(((Number) r.get("orderCount")).longValue())
                .build()).collect(Collectors.toList());
    }

    // Summary stat cards
    public SalesSummaryDto getSummary() {
        BigDecimal today = sumRevenueSince("CURDATE()");
        BigDecimal week = sumRevenueSince("(CURDATE() - INTERVAL 7 DAY)");
        BigDecimal month = sumRevenueSince("(CURDATE() - INTERVAL 30 DAY)");

        Object[] monthStats = (Object[]) em.createNativeQuery(
                "SELECT COALESCE(AVG(total_amount), 0), COUNT(*) FROM purchases " +
                "WHERE status = 'SUCCESS' AND purchased_at >= (CURDATE() - INTERVAL 30 DAY)")
                .getSingleResult();

        return SalesSummaryDto.builder()
                .todayRevenue(today)
                .weekRevenue(week)
                .monthRevenue(month)
                .avgOrderValue((BigDecimal) monthStats[0])
                .totalOrdersMonth(((Number) monthStats[1]).longValue())
                .build();
    }

    private BigDecimal sumRevenueSince(String sqlDateExpr) {
        Object result = em.createNativeQuery(
                "SELECT COALESCE(SUM(total_amount), 0) FROM purchases " +
                "WHERE status = 'SUCCESS' AND purchased_at >= " + sqlDateExpr)
                .getSingleResult();
        return (BigDecimal) result;
    }
}