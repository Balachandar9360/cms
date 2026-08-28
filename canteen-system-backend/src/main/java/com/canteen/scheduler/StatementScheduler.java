//package com.canteen.scheduler;
//
//import com.canteen.service.StatementService;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import java.time.YearMonth;
//
//// Runs at 06:30 on the 1st, statementizing the month that just ended.
//@Component
//@RequiredArgsConstructor
//public class StatementScheduler {
//
//    private static final Logger log = LoggerFactory.getLogger(StatementScheduler.class);
//    private final StatementService statementService;
//
//    @Scheduled(cron = "${canteen.statement.cron}")
//    public void sendMonthlyStatements() {
//        YearMonth lastMonth = YearMonth.now().minusMonths(1);
//        var results = statementService.sendAllForMonth(lastMonth);
//        long success = results.stream().filter(r -> "SUCCESS".equals(r.getStatus())).count();
//        log.info("Monthly statements for {} — sent: {}, failed: {}", lastMonth, success, results.size() - success);
//    }
//}