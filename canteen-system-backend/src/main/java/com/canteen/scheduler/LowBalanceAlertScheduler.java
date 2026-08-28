//package com.canteen.scheduler;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import com.canteen.service.LowBalanceAlertService;
//
//
//public class LowBalanceAlertScheduler {
//
//    @Autowired
//    private LowBalanceAlertService lowBalanceAlertService;
//
////    @Scheduled(cron = "${canteen.wallet.alert-cron}")
//    public void runDailyCheck() {
//        lowBalanceAlertService.checkAndSendAlerts();
//    }
//}