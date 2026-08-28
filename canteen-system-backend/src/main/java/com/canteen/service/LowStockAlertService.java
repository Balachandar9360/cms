package com.canteen.service;

import com.canteen.entity.CanteenItem;
import com.canteen.entity.Role;
import com.canteen.entity.User;
import com.canteen.repository.CanteenItemRepository;
import com.canteen.repository.UserRepository; // assumes you have this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LowStockAlertService {

    @Autowired
    private CanteenItemRepository canteenItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public void checkAndSendAlerts() {
        List<CanteenItem> lowStockItems = canteenItemRepository.findLowStockItems();
        if (lowStockItems.isEmpty()) return;

        // Adjust role_name values below to match your actual Role entity
        List<User> recipients = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null &&
                        ("ROLE_ADMIN".equals(u.getRole().getRoleName()) ||
                         "ROLE_STAFF".equals(u.getRole().getRoleName())))
                .collect(Collectors.toList());

        if (recipients.isEmpty()) return;

        String body = buildAlertBody(lowStockItems);

        for (User user : recipients) {
            // NOTE: your User entity has no email field — if staff/admin emails
            // live elsewhere (e.g. a separate profile table), swap this lookup.
            String email = resolveEmailForUser(user);
            if (email == null) continue;

            try {
                emailService.sendEmail(email, "Low Stock Alert - Canteen Items", body);
            } catch (Exception ignored) {}
        }
    }

    private String resolveEmailForUser(User user) {
        // TODO: implement based on where admin/staff emails are actually stored
        return null;
    }

    private String buildAlertBody(List<CanteenItem> items) {
        StringBuilder sb = new StringBuilder("The following items are low on stock:\n\n");
        for (CanteenItem item : items) {
            sb.append(String.format("- %s (%s): %d %s remaining (threshold: %d)%n",
                    item.getItemName(), item.getItemCode(),
                    item.getStockQuantity(), item.getUnit(), item.getLowStockThreshold()));
        }
        return sb.toString();
    }
}