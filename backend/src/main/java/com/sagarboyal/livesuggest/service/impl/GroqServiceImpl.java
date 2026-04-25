package com.sagarboyal.livesuggest.service.impl;

import com.sagarboyal.livesuggest.config.AppSettings;
import com.sagarboyal.livesuggest.config.GroqConfig;
import com.sagarboyal.livesuggest.payload.response.ChatResponse;
import com.sagarboyal.livesuggest.payload.request.GroqChatRequest;
import com.sagarboyal.livesuggest.payload.response.GroqChatResponse;
import com.sagarboyal.livesuggest.payload.response.GroqTranscriptionResponse;
import com.sagarboyal.livesuggest.payload.response.SuggestionResponse;
import com.sagarboyal.livesuggest.service.GroqService;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class GroqServiceImpl implements GroqService {
    private static final String WHISPER_MODEL = "whisper-large-v3";
    private static final int SUGGESTION_MAX_TOKENS = 700;
    private static final int CHAT_MAX_TOKENS = 1200;

    private final RestClient groqRestClient;
    private final JsonMapper jsonMapper;
    private final String chatModel;

    public GroqServiceImpl(RestClient groqRestClient, JsonMapper jsonMapper, GroqConfig.GroqProperties groqProperties) {
        this.groqRestClient = groqRestClient;
        this.jsonMapper = jsonMapper;
        this.chatModel = groqProperties.chatModel();
    }

    @Override
    public GroqTranscriptionResponse transcribe(MultipartFile audio) {
        if (audio.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("model", WHISPER_MODEL);
        body.add("file", new HttpEntity<>(toResource(audio), fileHeaders(audio)));
        body.add("response_format", "verbose_json");
        body.add("timestamp_granularities[]", "segment");

        GroqTranscriptionResponse response = groqRestClient.post()
                .uri("/audio/transcriptions")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(GroqTranscriptionResponse.class);

        if (response == null || response.text() == null) {
            throw new IllegalStateException("Groq transcription response did not include text");
        }

        return response;
    }

    @Override
    public SuggestionResponse getSuggestions(String transcript, AppSettings settings) {
        validateText(transcript, "Transcript is required");

        String content = chatCompletion(List.of(
                new GroqChatRequest.Message("system", settings.suggestionPrompt()),
                new GroqChatRequest.Message("user", """
                        Last %d transcript segment(s):

                        %s
                        """.formatted(settings.suggestionContextWindow(), applyContextWindow(transcript, settings.suggestionContextWindow())))
        ), SUGGESTION_MAX_TOKENS);

        try {
            SuggestionResponse response = jsonMapper.readValue(content, SuggestionResponse.class);
            if (response.suggestions() == null || response.suggestions().size() != 3) {
                throw new IllegalStateException("Groq suggestions response must include exactly 3 suggestions");
            }
            return response;
        } catch (JacksonException exception) {
            throw new IllegalStateException("Groq suggestions response was not valid JSON", exception);
        }
    }

    @Override
    public ChatResponse chat(String transcript, String question, AppSettings settings) {
        validateText(transcript, "Transcript is required");
        validateText(question, "Question is required");

        String content = chatCompletion(List.of(
                new GroqChatRequest.Message("system", settings.chatPrompt()),
                new GroqChatRequest.Message("user", """
                        Transcript:

                        %s

                        Question:
                        %s
                        """.formatted(applyContextWindow(transcript, settings.chatContextWindow()), question.trim()))
        ), CHAT_MAX_TOKENS);

        return new ChatResponse(content);
    }

    private String chatCompletion(List<GroqChatRequest.Message> messages, int maxTokens) {
        GroqChatRequest request = new GroqChatRequest(chatModel, messages, maxTokens);

        GroqChatResponse response = groqRestClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(GroqChatResponse.class);

        if (response == null || response.choices() == null || response.choices().isEmpty()
                || response.choices().getFirst().message() == null
                || response.choices().getFirst().message().content() == null
                || response.choices().getFirst().message().content().isBlank()) {
            throw new IllegalStateException("Groq chat response did not include content");
        }

        return stripJsonCodeFence(response.choices().getFirst().message().content().trim());
    }

    private String applyContextWindow(String transcript, int contextWindow) {
        String trimmedTranscript = transcript.trim();
        if (contextWindow <= 0) {
            return trimmedTranscript;
        }

        List<String> segments = trimmedTranscript.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .toList();

        if (segments.size() <= contextWindow) {
            return trimmedTranscript;
        }

        return String.join(System.lineSeparator(), segments.subList(segments.size() - contextWindow, segments.size()));
    }

    private String stripJsonCodeFence(String content) {
        if (!content.startsWith("```")) {
            return content;
        }

        return content.replaceFirst("^```(?:json)?\\s*", "")
                .replaceFirst("\\s*```$", "")
                .trim();
    }

    private void validateText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }

    private ByteArrayResource toResource(MultipartFile audio) {
        try {
            byte[] bytes = audio.getBytes();
            return new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return GroqServiceImpl.this.getFilename(audio);
                }
            };
        } catch (IOException exception) {
            throw new IllegalArgumentException("Unable to read audio file", exception);
        }
    }

    private HttpHeaders fileHeaders(MultipartFile audio) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(getContentType(audio));
        headers.setContentDispositionFormData("file", getFilename(audio));
        return headers;
    }

    private String getFilename(MultipartFile audio) {
        String filename = audio.getOriginalFilename();
        return filename == null || filename.isBlank() ? "audio" : filename;
    }

    private MediaType getContentType(MultipartFile audio) {
        String contentType = audio.getContentType();
        return contentType == null || contentType.isBlank()
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(contentType);
    }
}
