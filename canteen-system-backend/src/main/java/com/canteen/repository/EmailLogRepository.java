package com.canteen.repository;

import com.canteen.entity.EmailLog;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    long countByStatus(String status);
    
    @Query("SELECT e FROM EmailLog e WHERE e.student.id = :studentId AND e.emailType = :emailType " +
            "AND e.sentAt > :since ORDER BY e.sentAt DESC")
     List<EmailLog> findRecentAlerts(@Param("studentId") Long studentId,
                                      @Param("emailType") String emailType,
                                      @Param("since") LocalDateTime since);
    
    List<EmailLog> findTop50ByOrderBySentAtDesc();
    List<EmailLog> findTop50ByEmailTypeOrderBySentAtDesc(String emailType);
    
    
}
