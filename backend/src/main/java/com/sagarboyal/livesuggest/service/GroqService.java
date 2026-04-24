package com.sagarboyal.livesuggest.service;

import com.sagarboyal.livesuggest.config.AppSettings;
import com.sagarboyal.livesuggest.payload.response.ChatResponse;
import com.sagarboyal.livesuggest.payload.response.GroqTranscriptionResponse;
import com.sagarboyal.livesuggest.payload.response.SuggestionResponse;
import org.springframework.web.multipart.MultipartFile;

public interface GroqService {
	GroqTranscriptionResponse transcribe(MultipartFile audio);
	SuggestionResponse getSuggestions(String transcript, AppSettings settings);
	ChatResponse chat(String transcript, String question, AppSettings settings);
}
