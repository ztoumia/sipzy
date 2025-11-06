package com.sipzy.admin.service;

import com.sipzy.admin.domain.Activity;
import com.sipzy.admin.domain.Report;
import com.sipzy.admin.domain.ReportStatus;
import com.sipzy.admin.dto.response.ActivityResponse;
import com.sipzy.admin.dto.response.AdminStatsResponse;
import com.sipzy.admin.dto.response.ReportResponse;
import com.sipzy.admin.mapper.ActivityMapper;
import com.sipzy.admin.mapper.ReportMapper;
import com.sipzy.admin.repository.ActivityRepository;
import com.sipzy.admin.repository.ReportRepository;
import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.mapper.CoffeeMapper;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.coffee.service.CoffeeCommandService;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.exception.ForbiddenException;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.review.repository.ReviewRepository;
import com.sipzy.user.domain.User;
import com.sipzy.user.dto.response.UserResponse;
import com.sipzy.user.mapper.UserMapper;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Service - Dashboard and Moderation
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminService {

    private final CoffeeRepository coffeeRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ReportRepository reportRepository;
    private final ActivityRepository activityRepository;
    private final CoffeeCommandService coffeeCommandService;
    private final CoffeeMapper coffeeMapper;
    private final UserMapper userMapper;
    private final ReportMapper reportMapper;
    private final ActivityMapper activityMapper;

    public AdminStatsResponse getStats() {
        log.info("Getting admin stats");

        int totalCoffees = (int) coffeeRepository.count();
        int totalUsers = (int) userRepository.count();
        int totalReviews = (int) reviewRepository.count();

        int pendingCoffees = (int) coffeeRepository.findByStatus(Coffee.CoffeeStatus.PENDING, Pageable.unpaged())
            .getTotalElements();
        int approvedCoffees = (int) coffeeRepository.findByStatus(Coffee.CoffeeStatus.APPROVED, Pageable.unpaged())
            .getTotalElements();
        int rejectedCoffees = (int) coffeeRepository.findByStatus(Coffee.CoffeeStatus.REJECTED, Pageable.unpaged())
            .getTotalElements();

        int pendingReports = (int) reportRepository.countByStatus(ReportStatus.PENDING);

        return new AdminStatsResponse(
            totalCoffees,
            totalUsers,
            totalReviews,
            pendingCoffees,
            pendingReports,
            approvedCoffees,
            rejectedCoffees
        );
    }

    public PageResponse<CoffeeResponse> getPendingCoffees(int page, int limit) {
        log.info("Getting pending coffees - page: {}, limit: {}", page, limit);

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Coffee> coffeePage = coffeeRepository.findByStatus(Coffee.CoffeeStatus.PENDING, pageable);

        List<CoffeeResponse> coffees = coffeePage.getContent().stream()
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());

        return PageResponse.of(coffees, page, limit, coffeePage.getTotalElements());
    }

    @Transactional
    public CoffeeResponse approveCoffee(Long coffeeId, Long moderatorId, String adminNotes) {
        log.info("Approving coffee: {} by moderator: {}", coffeeId, moderatorId);

        return coffeeCommandService.approveCoffee(coffeeId, moderatorId);
    }

    @Transactional
    public CoffeeResponse rejectCoffee(Long coffeeId, Long moderatorId, String reason) {
        log.info("Rejecting coffee: {} by moderator: {}", coffeeId, moderatorId);

        return coffeeCommandService.rejectCoffee(coffeeId, moderatorId, reason);
    }

    public PageResponse<CoffeeResponse> getAllCoffees(String status, String search, int page, int limit) {
        log.info("Getting all coffees admin - status: {}, search: {}", status, search);

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Coffee> coffeePage;

        if (status != null && !status.isEmpty()) {
            try {
                Coffee.CoffeeStatus coffeeStatus = Coffee.CoffeeStatus.valueOf(status.toUpperCase());
                coffeePage = coffeeRepository.findByStatus(coffeeStatus, pageable);
            } catch (IllegalArgumentException e) {
                // Invalid status, return all
                coffeePage = coffeeRepository.findAll(pageable);
            }
        } else {
            coffeePage = coffeeRepository.findAll(pageable);
        }

        List<CoffeeResponse> coffees = coffeePage.getContent().stream()
            .map(coffeeMapper::toCoffeeResponse)
            .collect(Collectors.toList());

        return PageResponse.of(coffees, page, limit, coffeePage.getTotalElements());
    }

    // ==================== User Management ====================

    /**
     * Get all users with pagination
     */
    public PageResponse<UserResponse> getAllUsers(int page, int limit) {
        log.info("Getting all users - page: {}, limit: {}", page, limit);

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserResponse> users = userPage.getContent().stream()
            .map(userMapper::toUserResponse)
            .collect(Collectors.toList());

        return PageResponse.of(users, page, limit, userPage.getTotalElements());
    }

    /**
     * Ban a user (sets isActive to false)
     */
    @Transactional
    public UserResponse banUser(Long userId, Long adminId, String reason) {
        log.info("Banning user: {} by admin: {}, reason: {}", userId, adminId, reason);

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!admin.isAdmin()) {
            throw new ForbiddenException("Only admins can ban users");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.isAdmin()) {
            throw new ForbiddenException("Cannot ban another admin");
        }

        user.setIsActive(false);
        user = userRepository.save(user);

        log.info("User banned successfully: {}", userId);
        return userMapper.toUserResponse(user);
    }

    /**
     * Unban a user (sets isActive to true)
     */
    @Transactional
    public UserResponse unbanUser(Long userId, Long adminId) {
        log.info("Unbanning user: {} by admin: {}", userId, adminId);

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!admin.isAdmin()) {
            throw new ForbiddenException("Only admins can unban users");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(true);
        user = userRepository.save(user);

        log.info("User unbanned successfully: {}", userId);
        return userMapper.toUserResponse(user);
    }

    // ==================== Report Moderation ====================

    /**
     * Get all pending reports
     */
    public PageResponse<ReportResponse> getPendingReports(int page, int limit) {
        log.info("Getting pending reports - page: {}, limit: {}", page, limit);

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Report> reportPage = reportRepository.findByStatus(ReportStatus.PENDING, pageable);

        List<ReportResponse> reports = reportPage.getContent().stream()
            .map(reportMapper::toReportResponse)
            .collect(Collectors.toList());

        return PageResponse.of(reports, page, limit, reportPage.getTotalElements());
    }

    /**
     * Get all reports with optional status filter
     */
    public PageResponse<ReportResponse> getAllReports(String status, int page, int limit) {
        log.info("Getting all reports - status: {}, page: {}, limit: {}", status, page, limit);

        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Report> reportPage;

        if (status != null && !status.isEmpty()) {
            try {
                ReportStatus reportStatus = ReportStatus.valueOf(status.toUpperCase());
                reportPage = reportRepository.findByStatus(reportStatus, pageable);
            } catch (IllegalArgumentException e) {
                reportPage = reportRepository.findAll(pageable);
            }
        } else {
            reportPage = reportRepository.findAll(pageable);
        }

        List<ReportResponse> reports = reportPage.getContent().stream()
            .map(reportMapper::toReportResponse)
            .collect(Collectors.toList());

        return PageResponse.of(reports, page, limit, reportPage.getTotalElements());
    }

    /**
     * Resolve a report (action was taken)
     */
    @Transactional
    public ReportResponse resolveReport(Long reportId, Long adminId, String adminNotes) {
        log.info("Resolving report: {} by admin: {}", reportId, adminId);

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!admin.isAdmin()) {
            throw new ForbiddenException("Only admins can moderate reports");
        }

        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        report.setStatus(ReportStatus.RESOLVED);
        report.setResolvedBy(admin);
        report.setResolvedAt(java.time.Instant.now());
        report.setAdminNotes(adminNotes);

        report = reportRepository.save(report);

        log.info("Report resolved successfully: {}", reportId);
        return reportMapper.toReportResponse(report);
    }

    /**
     * Dismiss a report (no action needed)
     */
    @Transactional
    public ReportResponse dismissReport(Long reportId, Long adminId, String adminNotes) {
        log.info("Dismissing report: {} by admin: {}", reportId, adminId);

        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!admin.isAdmin()) {
            throw new ForbiddenException("Only admins can moderate reports");
        }

        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        report.setStatus(ReportStatus.DISMISSED);
        report.setResolvedBy(admin);
        report.setResolvedAt(java.time.Instant.now());
        report.setAdminNotes(adminNotes);

        report = reportRepository.save(report);

        log.info("Report dismissed successfully: {}", reportId);
        return reportMapper.toReportResponse(report);
    }

    // ==================== Activity Log ====================

    /**
     * Get recent admin activities
     */
    public List<ActivityResponse> getRecentActivity(int limit) {
        log.info("Getting recent activities - limit: {}", limit);

        Pageable pageable = PageRequest.of(0, limit);
        List<Activity> activities = activityRepository.findAllByOrderByCreatedAtDesc(pageable);

        return activities.stream()
                .map(activityMapper::toActivityResponse)
                .collect(Collectors.toList());
    }

}
