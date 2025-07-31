package com.cabana.bookingapp;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    public void sendReservationConfirmation(String to, String name, LocalDate checkIn,LocalDate checkOut,boolean paid,String paymentMethod){
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setFrom("cabaneleanuca@gmail.com");
        mailMessage.setSubject("Confirmare rezervare - Cabanele A-nuc-A");
        mailMessage.setText("Salut, " + name + "!\n\nRezervarea ta a fost înregistrată cu succes:\n" +
                "Check-in: " + checkIn + "\n" +
                "Check-out: " + checkOut + "\n" +
                "Plătit : " + (paid ? "Da" : "Nu") + "\n" +
                "Metoda de plată: " + paymentMethod + "\n" +
                "\n" +
                "Îți mulțumim că ai ales Cabanele A-nuc-A!");
        mailSender.send(mailMessage);
    }

    public void sendPaymentConfirmation(String to, String name, LocalDate checkIn,LocalDate checkOut,Double totalPrice,String paymentMethod){
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setFrom("cabaneleanuca@gmail.com");
        mailMessage.setSubject("Confirmare plată - Cabanele A-nuc-A");

        mailMessage.setText("Salut, " + name + "!\n\n" +
                "Plata pentru rezervarea ta a fost confirmată cu succes!\n\n" +
                "Detalii rezervare:\n" +
                "Check-in: " + checkIn + "\n" +
                "Check-out: " + checkOut + "\n" +
                "Suma plătită: " + totalPrice + " LEI\n" +
                "Metoda de plată: " + paymentMethod + "\n\n" +
                "Îți mulțumim pentru încrederea acordată!\n\n" +
                "O zi frumoasă,\n" +
                "Echipa Cabanele A-nuc-A");

        mailSender.send(mailMessage);
    }

    public void sendContactEmail(ContactRequest contactRequest){
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo("cabaneleanuca@gmail.com");
        mailMessage.setFrom(contactRequest.getEmail());
        mailMessage.setSubject("[Contact Form] " + contactRequest.getSubject());
        mailMessage.setText("Nume: " + contactRequest.getName() + "\n" +
                "Email: " + contactRequest.getEmail() + "\n\n" +
                "Mesaj:\n" + contactRequest.getMessage());
        mailSender.send(mailMessage);
    }
}
