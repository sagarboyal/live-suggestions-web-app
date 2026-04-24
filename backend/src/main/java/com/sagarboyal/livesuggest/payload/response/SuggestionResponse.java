package com.sagarboyal.livesuggest.payload.response;

import com.sagarboyal.livesuggest.payload.request.Suggestion;

import java.util.List;

public record SuggestionResponse(List<Suggestion> suggestions) {
}
