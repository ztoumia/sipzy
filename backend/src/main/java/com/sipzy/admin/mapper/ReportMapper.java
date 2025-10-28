package com.sipzy.admin.mapper;

import com.sipzy.admin.domain.Report;
import com.sipzy.admin.dto.response.ReportResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReportMapper {

    @Mapping(source = "reporter.id", target = "reportedById")
    @Mapping(source = "reporter.username", target = "reportedByUsername")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "resolvedBy.id", target = "reviewedById")
    @Mapping(source = "resolvedBy.username", target = "reviewedByUsername")
    @Mapping(source = "resolvedAt", target = "reviewedAt")
    ReportResponse toReportResponse(Report report);
}
