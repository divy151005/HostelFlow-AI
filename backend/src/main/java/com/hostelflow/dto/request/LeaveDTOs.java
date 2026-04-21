package com.hostelflow.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

public class LeaveDTOs {

    @Data
    public static class CreateLeaveRequest {
        @NotBlank
        private String type; // LEAVE, OUTING, EMERGENCY

        private String outingKind;

        @NotBlank
        private String reason;

        private String destination;

        @NotNull
        private LocalDateTime fromDate;

        @NotNull
        private LocalDateTime toDate;

        @NotNull
        private LocalDateTime expectedReturn;
    }

    @Data
    public static class ApproveRejectRequest {
        @NotBlank
        private String action; // APPROVE or REJECT
        private String remark;
    }

    @Data
    public static class ParentApprovalRequest {
        @NotBlank
        private String leaveId;
        @NotBlank
        private String action; // YES or NO
        private String message;
    }

    @Data
    public static class QRScanRequest {
        @NotBlank
        private String qrToken;
        @NotBlank
        private String scanType; // IN or OUT
    }
}
