//package com.canteen.scheduler;
//
//import com.canteen.service.LowBalanceAlertService;
//import com.canteen.service.LowStockAlertService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//@Component
//public class DailyChecksScheduler {
//
//    @Autowired
//    private LowBalanceAlertService lowBalanceAlertService;
//
//    @Autowired
//    private LowStockAlertService lowStockAlertService;
//
////    @Scheduled(cron = "${canteen.wallet.alert-cron}")
//    public void runDailyChecks() {
//        // Each check is independent — if one fails, it shouldn't block the other
//        try {
//            lowBalanceAlertService.checkAndSendAlerts(); // -> emails students
//        } catch (Exception e) {
//            System.err.println("Low balance check failed: " + e.getMessage());
//        }
//
//        try {
//            lowStockAlertService.checkAndSendAlerts(); // -> emails admin/staff
//        } catch (Exception e) {
//            System.err.println("Low stock check failed: " + e.getMessage());
//        }
//    }
//}