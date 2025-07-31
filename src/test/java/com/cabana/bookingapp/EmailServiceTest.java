package com.cabana.bookingapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    public void sendReservationConfirmation_Success() {
        // Given
        String email = "test@example.com";
        String name = "Test";
        LocalDate checkIn = LocalDate.now();
        LocalDate checkOut = LocalDate.now().plusDays(2);

        // When
        emailService.sendReservationConfirmation(email, name, checkIn, checkOut, true, "CARD");

        // Then
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}