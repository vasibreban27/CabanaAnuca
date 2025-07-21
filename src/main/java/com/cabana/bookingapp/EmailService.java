package com.cabana.bookingapp;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
@Service
public class EmailService {
    private JavaMailSender mailSender;
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    public void sendReservationConfirmation(String to, String name, LocalDate checkIn,LocalDate checkOut){
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setFrom("cabaneleanuca@gmail.com");
        mailMessage.setSubject("Confirmare rezervare - Cabanele A-nuc-A");
        mailMessage.setText("Salut, " + name + "!\n\nRezervarea ta a fost înregistrată cu succes:\n" +
                "Check-in: " + checkIn + "\n" +
                "Check-out: " + checkOut + "\n\n" +
                "Îți mulțumim că ai ales Cabanele A-nuc-A!");
        mailSender.send(mailMessage);
    }
}
