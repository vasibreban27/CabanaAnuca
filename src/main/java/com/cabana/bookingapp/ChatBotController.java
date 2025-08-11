package com.cabana.bookingapp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static java.util.Map.entry;

@RestController
@RequestMapping("/api/chat")
public class ChatBotController {

    private final Map<String, String> responses = Map.ofEntries(
            entry("salut", "Bună ziua! Cu ce vă pot ajuta?"),
            entry("bună", "Bună ziua! Cu ce vă pot ajuta?"),
            entry("cabane", "Avem 3 tipuri de cabane: STANDARD (150 lei), FAMILIE (200 lei), DELUXE (250 lei)"),
            entry("standard", "Cabana STANDARD are 1 cameră, preț 150 lei/noapte"),
            entry("familie", "Cabana FAMILIE are 2 camere pentru 4 persoane, preț 200 lei/noapte"),
            entry("deluxe", "Cabana DELUXE are 1 cameră pentru 2 persoane, preț 250 lei/noapte"),
            entry("anulare", "Politica de anulare: 48h înainte de check-in")
    );

    @PostMapping
    public ResponseEntity<String> handleMessage(@RequestBody Map<String, String> payload) {
        String message = payload.get("message").toLowerCase();

        String response = responses.entrySet().stream()
                .filter(e -> message.contains(e.getKey()))
                .findFirst()
                .map(Map.Entry::getValue)
                .orElse("Ne pare rău, nu înțeleg întrebarea. Puteți întreba despre cabane, prețuri sau politică de anulare.");

        return ResponseEntity.ok(response);
    }
}