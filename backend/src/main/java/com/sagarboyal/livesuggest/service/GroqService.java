package com.sagarboyal.livesuggest.service;

import org.springframework.web.multipart.MultipartFile;

public interface GroqService {
	String transcribe(MultipartFile audio);
}
