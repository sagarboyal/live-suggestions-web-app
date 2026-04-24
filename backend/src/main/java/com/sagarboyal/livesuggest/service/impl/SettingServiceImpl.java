package com.sagarboyal.livesuggest.service.impl;

import com.sagarboyal.livesuggest.config.AppSettings;
import com.sagarboyal.livesuggest.service.SettingsService;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicReference;

@Service
public class SettingServiceImpl implements SettingsService {

    private final AtomicReference<AppSettings> settings = new AtomicReference<>(AppSettings.defaults());

    public AppSettings getSettings() {
        return settings.get();
    }


    @Override
    public AppSettings updateSettings(AppSettings update) {
        if (update == null) {
            throw new IllegalArgumentException("Settings body is required");
        }

        return settings.updateAndGet(current -> new AppSettings(
                useString(update.suggestionPrompt(), current.suggestionPrompt()),
                useString(update.chatPrompt(), current.chatPrompt()),
                usePositiveInt(update.suggestionContextWindow(), current.suggestionContextWindow()),
                useNonNegativeInt(update.chatContextWindow(), current.chatContextWindow())
        ));
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
