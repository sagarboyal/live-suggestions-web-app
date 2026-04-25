package com.sagarboyal.livesuggest.service.impl;

import com.sagarboyal.livesuggest.config.AppSettings;
import com.sagarboyal.livesuggest.service.SettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class SettingServiceImpl implements SettingsService {
    private static final Logger logger = LoggerFactory.getLogger(SettingServiceImpl.class);

    private final AtomicReference<AppSettings> settings = new AtomicReference<>(AppSettings.defaults());

    public AppSettings getSettings() {
        logger.info("Service invoked method={} action={} timestamp={}",
                "getSettings", "load_application_settings", Instant.now());
        AppSettings currentSettings = settings.get();
        logger.info("Service completed method={} action={} timestamp={}",
                "getSettings", "settings_loaded", Instant.now());
        return currentSettings;
    }


    @Override
    public AppSettings updateSettings(AppSettings update) {
        logger.info("Service invoked method={} action={} timestamp={}",
                "updateSettings", "update_application_settings", Instant.now());

        if (update == null) {
            throw new IllegalArgumentException("Settings body is required");
        }

        AppSettings updatedSettings = settings.updateAndGet(current -> new AppSettings(
                useString(update.suggestionPrompt(), current.suggestionPrompt()),
                useString(update.chatPrompt(), current.chatPrompt()),
                usePositiveInt(update.suggestionContextWindow(), current.suggestionContextWindow()),
                useNonNegativeInt(update.chatContextWindow(), current.chatContextWindow())
        ));

        logger.info("Service completed method={} action={} timestamp={}",
                "updateSettings", "settings_updated", Instant.now());
        return updatedSettings;
    }

    private String useString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private int usePositiveInt(int value, int fallback) {
        return value > 0 ? value : fallback;
    }

    private int useNonNegativeInt(int value, int fallback) {
        return value >= 0 ? value : fallback;
    }
}
