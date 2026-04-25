package com.sagarboyal.livesuggest.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(GroqConfig.GroqProperties.class)
public class GroqConfig {

	@Bean
	RestClient groqRestClient(GroqProperties groqProperties) {
		String apiKey = normalizeApiKey(groqProperties.api().key());

		return RestClient.builder()
				.baseUrl(groqProperties.api().url())
				.defaultHeaders(headers -> headers.setBearerAuth(apiKey))
				.build();
	}

	private String normalizeApiKey(String apiKey) {
		if (apiKey == null || apiKey.isBlank() || "your_key_here".equals(apiKey)) {
			throw new IllegalStateException("Set GROQ_API_KEY or GROQ_KEY before starting the application");
		}

		String trimmedApiKey = apiKey.trim();
		if (trimmedApiKey.regionMatches(true, 0, "Bearer ", 0, 7)) {
			return trimmedApiKey.substring(7).trim();
		}

		return trimmedApiKey;
	}

	@ConfigurationProperties(prefix = "groq")
	public record GroqProperties(Api api, Chat chat) {

		public String chatModel() {
			return chat != null && chat.model() != null && !chat.model().isBlank()
					? chat.model().trim()
					: "openai/gpt-oss-120b";
		}

		public record Api(String key, String url) {
		}

		public record Chat(String model) {
		}
	}
}
