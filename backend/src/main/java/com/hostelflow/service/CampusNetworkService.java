package com.hostelflow.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class CampusNetworkService {

    public static final Set<String> AUTHORIZED_CAMPUS_SSIDS = Set.of(
            "HostelFlow-Campus-WiFi",
            "HostelFlow-Secure-5G",
            "Campus-Hostel-LAN",
            "Hostel-Block-A-WiFi",
            "Hostel-Block-B-WiFi",
            "College-Campus-Main"
    );

    @Data
    @Builder
    public static class NetworkVerificationResult {
        private boolean isCampusWifi;
        private String networkSsid;
        private String clientIp;
        private String status; // "AUTHORIZED_CAMPUS_NETWORK" or "EXTERNAL_CELLULAR_NETWORK"
        private String message;
        private List<String> authorizedSsids;
    }

    public NetworkVerificationResult verifyNetwork(HttpServletRequest request, String clientProvidedSsid, boolean simulateCellular) {
        String clientIp = getClientIp(request);
        String headerSsid = request != null ? request.getHeader("X-Campus-Wifi-SSID") : null;
        String simulateHeader = request != null ? request.getHeader("X-Simulate-Network") : null;

        if (simulateCellular || "CELLULAR".equalsIgnoreCase(simulateHeader)) {
            return NetworkVerificationResult.builder()
                    .isCampusWifi(false)
                    .networkSsid("Airtel/Jio 5G Mobile Data (External)")
                    .clientIp(clientIp)
                    .status("EXTERNAL_CELLULAR_NETWORK")
                    .message("Connected to external cellular network. Hostel outings require connection to official hostel Wi-Fi.")
                    .authorizedSsids(List.copyOf(AUTHORIZED_CAMPUS_SSIDS))
                    .build();
        }

        String tempSsid = "HostelFlow-Campus-WiFi";
        if (clientProvidedSsid != null && !clientProvidedSsid.isBlank()) {
            tempSsid = clientProvidedSsid.trim();
        } else if (headerSsid != null && !headerSsid.isBlank()) {
            tempSsid = headerSsid.trim();
        }
        final String effectiveSsid = tempSsid;

        boolean ssidMatches = AUTHORIZED_CAMPUS_SSIDS.stream()
                .anyMatch(s -> s.equalsIgnoreCase(effectiveSsid));

        boolean isLocalOrCampusIp = isCampusIp(clientIp);

        boolean isAuthorized = ssidMatches && isLocalOrCampusIp;

        return NetworkVerificationResult.builder()
                .isCampusWifi(isAuthorized)
                .networkSsid(effectiveSsid)
                .clientIp(clientIp)
                .status(isAuthorized ? "AUTHORIZED_CAMPUS_NETWORK" : "EXTERNAL_CELLULAR_NETWORK")
                .message(isAuthorized
                        ? "Verified: Connected to authorized college hostel Wi-Fi (" + effectiveSsid + ")."
                        : "Security Warning: Not connected to authorized hostel Wi-Fi. Outing applications are restricted.")
                .authorizedSsids(List.copyOf(AUTHORIZED_CAMPUS_SSIDS))
                .build();
    }

    public void enforceCampusWifiForOuting(HttpServletRequest request, String clientProvidedSsid, boolean simulateCellular) {
        NetworkVerificationResult res = verifyNetwork(request, clientProvidedSsid, simulateCellular);
        if (!res.isCampusWifi()) {
            throw new RuntimeException("OUTING_WIFI_RESTRICTION: Outing application blocked. You must be connected to the official College Hostel Wi-Fi ('HostelFlow-Campus-WiFi') while inside the hostel premises. External mobile data is not permitted.");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        } else if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "127.0.0.1";
    }

    private boolean isCampusIp(String ip) {
        if (ip == null) return false;
        return ip.equals("127.0.0.1") || 
               ip.equals("0:0:0:0:0:0:0:1") || 
               ip.startsWith("10.") || 
               ip.startsWith("192.168.") || 
               ip.startsWith("172.16.") || 
               ip.startsWith("172.20.") || 
               ip.startsWith("172.30.");
    }
}
