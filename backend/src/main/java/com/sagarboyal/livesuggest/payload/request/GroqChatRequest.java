package com.sagarboyal.livesuggest.payload.request;

import java.util.List;

public record GroqChatRequest(
        String model,
        List<Message> messages,
        int max_tokens
) {
    public record Message(
            String role,
            String content
    ) {
    }
}
