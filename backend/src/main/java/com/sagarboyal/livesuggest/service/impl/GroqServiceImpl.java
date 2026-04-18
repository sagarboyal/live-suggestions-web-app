package com.sagarboyal.livesuggest.service.impl;

import com.sagarboyal.livesuggest.payload.GroqTranscriptionResponse;
import com.sagarboyal.livesuggest.service.GroqService;
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

@Service
public class GroqServiceImpl implements GroqService {
    private static final String WHISPER_MODEL = "whisper-large-v3";

    private final RestClient groqRestClient;

    public GroqServiceImpl(RestClient groqRestClient) {
        this.groqRestClient = groqRestClient;
    }

    @Override
    public String transcribe(MultipartFile audio) {
        if (audio.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("model", WHISPER_MODEL);
        body.add("file", new HttpEntity<>(toResource(audio), fileHeaders(audio)));

        GroqTranscriptionResponse response = groqRestClient.post()
                .uri("/audio/transcriptions")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(GroqTranscriptionResponse.class);

        if (response == null || response.text() == null) {
            throw new IllegalStateException("Groq transcription response did not include text");
        }

        return response.text();
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
