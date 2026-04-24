package com.sagarboyal.livesuggest.controller;

import com.sagarboyal.livesuggest.payload.request.ChatRequest;
import com.sagarboyal.livesuggest.payload.response.ApiResponse;
import com.sagarboyal.livesuggest.payload.response.ChatResponse;
import com.sagarboyal.livesuggest.service.GroqService;
import com.sagarboyal.livesuggest.service.SettingsService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ChatController {
    private final GroqService groqService;
    private final SettingsService settingsService;

    public ChatController(GroqService groqService, SettingsService settingsService) {
        this.groqService = groqService;
        this.settingsService = settingsService;
    }

    @PostMapping(value = "/chat", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @RequestBody ChatRequest request,
            @org.springframework.web.bind.annotation.RequestHeader("X-Groq-Api-Key") String apiKey) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        ChatResponse response = groqService.chat(request.transcript(), request.question(), settingsService.getSettings(), apiKey);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "Chat response generated successfully", response));
    }
}
