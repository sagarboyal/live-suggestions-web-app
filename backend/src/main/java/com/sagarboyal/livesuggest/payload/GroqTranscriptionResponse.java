package com.sagarboyal.livesuggest.payload;

import java.util.List;

public record GroqTranscriptionResponse(
        String text,
        List<Segment> segments
) {
    public record Segment(
            double start,
            double end,
            String text
    ) {}
}
