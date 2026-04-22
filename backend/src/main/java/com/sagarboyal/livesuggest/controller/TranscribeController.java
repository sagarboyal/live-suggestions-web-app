package com.sagarboyal.livesuggest.controller;

import com.sagarboyal.livesuggest.payload.GroqTranscriptionResponse;
import com.sagarboyal.livesuggest.service.GroqService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class TranscribeController {

	private final GroqService groqService;

	public TranscribeController(GroqService groqService) {
		this.groqService = groqService;
	}

	@PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<GroqTranscriptionResponse> transcribe(@RequestParam("audio") MultipartFile audio) {
		return ResponseEntity.ok(groqService.transcribe(audio));
	}
}
