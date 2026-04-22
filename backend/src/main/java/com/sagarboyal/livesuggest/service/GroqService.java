package com.sagarboyal.livesuggest.service;

import com.sagarboyal.livesuggest.payload.GroqTranscriptionResponse;
import org.springframework.web.multipart.MultipartFile;

public interface GroqService {
	GroqTranscriptionResponse transcribe(MultipartFile audio);
}
