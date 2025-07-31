package com.cabana.bookingapp;

import com.cabana.bookingapp.ContactController;
import com.cabana.bookingapp.EmailService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContactController.class)
public class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;
    private EmailService emailService;

    @Test
    public void sendContactMessage_Success() throws Exception {
        String requestBody = """
            {
                "name": "Test",
                "email": "test@example.com",
                "subject": "Test Subject",
                "message": "Test Message"
            }
            """;

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Mesajul a fost trimis cu succes!"));

        Mockito.verify(emailService).sendContactEmail(Mockito.any(ContactRequest.class));
    }
}