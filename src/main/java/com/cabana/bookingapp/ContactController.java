package com.cabana.bookingapp;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/contact")
    public ResponseEntity<?> sendContactMessage(@Valid @RequestBody ContactRequest contactRequest) {
        System.out.println("Received contact request: " + contactRequest.toString()); // Debug log
        try {
            emailService.sendContactEmail(contactRequest);
            System.out.println("Email sent successfully"); // Debug log
            return ResponseEntity.ok().body(Map.of("message", "Mesajul a fost trimis cu succes!"));
        } catch(Exception e) {
            System.out.println("Error sending email: " + e.getMessage()); // Debug log
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Eroare la trimiterea mesajului: " + e.getMessage()));
        }
    }
}
