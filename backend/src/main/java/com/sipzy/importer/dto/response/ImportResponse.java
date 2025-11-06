package com.sipzy.importer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Response for import operations containing results and statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResponse {

    /**
     * Timestamp of the import operation.
     */
    @Builder.Default
    private Instant timestamp = Instant.now();

    /**
     * Total number of items processed.
     */
    private Integer totalProcessed;

    /**
     * Number of successful imports.
     */
    private Integer successCount;

    /**
     * Number of failed imports.
     */
    private Integer errorCount;

    /**
     * Number of items skipped.
     */
    private Integer skipCount;

    /**
     * Number of items created.
     */
    private Integer createCount;

    /**
     * Number of items updated.
     */
    private Integer updateCount;

    /**
     * Detailed results for each import operation.
     */
    @Builder.Default
    private List<ImportResult> results = new ArrayList<>();

    /**
     * Overall status message.
     */
    private String message;

    /**
     * Add a result to the response.
     */
    public void addResult(ImportResult result) {
        if (results == null) {
            results = new ArrayList<>();
        }
        results.add(result);
        updateCounts();
    }

    /**
     * Update counts based on results.
     */
    private void updateCounts() {
        totalProcessed = results.size();
        successCount = (int) results.stream().filter(ImportResult::getSuccess).count();
        errorCount = (int) results.stream().filter(r -> !r.getSuccess()).count();
        skipCount = (int) results.stream()
                .filter(r -> r.getOperation() == ImportResult.Operation.SKIP)
                .count();
        createCount = (int) results.stream()
                .filter(r -> r.getOperation() == ImportResult.Operation.CREATE)
                .count();
        updateCount = (int) results.stream()
                .filter(r -> r.getOperation() == ImportResult.Operation.UPDATE)
                .count();
    }

    /**
     * Generate summary message.
     */
    public void generateMessage() {
        updateCounts();
        this.message = String.format(
                "Import completed: %d total, %d created, %d updated, %d errors, %d skipped",
                totalProcessed, createCount, updateCount, errorCount, skipCount
        );
    }
}
