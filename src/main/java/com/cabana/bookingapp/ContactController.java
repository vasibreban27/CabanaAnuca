package com.cabana.bookingapp;


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
    public ResponseEntity<?> sendContactMessage(@RequestBody ContactRequest contactRequest ) {
        try{
            emailService.sendContactEmail(contactRequest);
            return ResponseEntity.ok().body(Map.of("message", "Mesajul a fost trimis cu succes!"));
        }catch(Exception e ){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Eroare la trimiterea mesajului: " + e.getMessage()));
        }

}
}
