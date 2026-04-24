package com.sagarboyal.livesuggest.payload.request;

public record ChatRequest(
        String transcript,
        String question
) {
}
