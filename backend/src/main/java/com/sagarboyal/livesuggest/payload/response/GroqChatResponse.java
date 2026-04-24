package com.sagarboyal.livesuggest.payload.response;

import java.util.List;

public record GroqChatResponse(List<Choice> choices) {
    public record Choice(Message message) {
    }

    public record Message(String content) {
    }
}
