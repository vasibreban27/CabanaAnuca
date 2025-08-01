package com.cabana.bookingapp;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
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

    public void sendContactEmail(ContactRequest contactRequest) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setTo("cabaneleanuca@gmail.com");

        helper.setReplyTo(contactRequest.getEmail());
        helper.setFrom(new InternetAddress("noreply@cabaneleanuca.ro", "Cabanele A-nuc-A")); // Adresă generică a afacerii

        helper.setSubject("Mesaj nou: " + contactRequest.getSubject());

        String text = String.format(
                "Nume: %s\nEmail: %s\n\nMesaj:\n%s",
                contactRequest.getName(),
                contactRequest.getEmail(),
                contactRequest.getMessage()
        );
        helper.setText(text);
        mailSender.send(message);
    }
}
