package com.sipzy.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Async Configuration for asynchronous operations
 * Enables @Async annotation for email sending and other background tasks
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
