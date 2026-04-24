package com.sagarboyal.livesuggest.payload.request;

public record Suggestion(
        String title,
        String preview,
        String type
) {
}
