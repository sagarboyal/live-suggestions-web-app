package com.sagarboyal.livesuggest.controller;

import com.sagarboyal.livesuggest.config.AppSettings;
import com.sagarboyal.livesuggest.payload.response.ApiResponse;
import com.sagarboyal.livesuggest.service.SettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SettingsController {
    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping(value = "/settings", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<AppSettings>> getSettings() {
        AppSettings settings = settingsService.getSettings();
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "Settings retrieved successfully", settings));
    }
}
