package com.sipzy.admin.repository;

import com.sipzy.admin.domain.Report;
import com.sipzy.admin.domain.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    long countByStatus(ReportStatus status);

    List<Report> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
