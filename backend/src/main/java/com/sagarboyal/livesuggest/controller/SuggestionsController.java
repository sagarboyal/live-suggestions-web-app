package com.sagarboyal.livesuggest.controller;

import com.sagarboyal.livesuggest.payload.request.SuggestionRequest;
import com.sagarboyal.livesuggest.payload.response.ApiResponse;
import com.sagarboyal.livesuggest.payload.response.SuggestionResponse;
import com.sagarboyal.livesuggest.service.GroqService;
import com.sagarboyal.livesuggest.service.SettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SuggestionsController {
    private final GroqService groqService;
    private final SettingsService settingsService;

    public SuggestionsController(GroqService groqService, SettingsService settingsService) {
        this.groqService = groqService;
        this.settingsService = settingsService;
    }

    @PostMapping(value = "/suggestions", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<SuggestionResponse>> getSuggestions(@RequestBody SuggestionRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        SuggestionResponse response = groqService.getSuggestions(request.transcript(), settingsService.getSettings());
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "Suggestions generated successfully", response));
    }
}
