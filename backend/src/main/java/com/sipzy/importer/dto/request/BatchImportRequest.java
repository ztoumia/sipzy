package com.sipzy.importer.dto.request;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for batch import operations.
 * Allows importing multiple roasters and coffees in a single request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchImportRequest {

    /**
     * List of roasters to import.
     */
    @Valid
    private List<ImportRoasterRequest> roasters;

    /**
     * List of coffees to import.
     */
    @Valid
    private List<ImportCoffeeRequest> coffees;

    /**
     * Whether to continue on error or stop at first error.
     * Default is true (continue on error).
     */
    @Builder.Default
    private Boolean continueOnError = true;

    /**
     * Whether to auto-approve all imported coffees.
     * Default is false.
     */
    @Builder.Default
    private Boolean autoApprove = false;
}
