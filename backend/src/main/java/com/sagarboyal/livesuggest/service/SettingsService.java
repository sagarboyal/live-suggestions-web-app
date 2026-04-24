package com.sagarboyal.livesuggest.service;

import com.sagarboyal.livesuggest.config.AppSettings;

public interface SettingsService {
    AppSettings getSettings();
    AppSettings updateSettings(AppSettings update);
}
