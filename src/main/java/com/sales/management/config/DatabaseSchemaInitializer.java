package com.sales.management.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        alterProductTextColumns();
    }

    private void alterProductTextColumns() {
        try {
            jdbcTemplate.execute("ALTER TABLE products ALTER COLUMN description TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE products ALTER COLUMN specifications TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE products ALTER COLUMN image_url TYPE TEXT");
        } catch (RuntimeException exception) {
            log.warn("Could not verify product text columns. Hibernate may create them on first startup.", exception);
        }
    }
}
