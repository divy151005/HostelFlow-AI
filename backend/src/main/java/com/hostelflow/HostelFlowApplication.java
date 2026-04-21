package com.hostelflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HostelFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(HostelFlowApplication.class, args);
    }
}
