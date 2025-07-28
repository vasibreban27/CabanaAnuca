package com.cabana.bookingapp;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    @Autowired
    public PaymentController(ReservationRepository reservationRepository,EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
        Stripe.apiKey = "sk_test_51RnEYgQIGXPdxi2IROwmZqU78rzjUOo2cyoP1Gr2lASIINLPXse7MmshjyOzvQBfjIDHHgCB6ASIrxjY9nKfm2MW00OPHDIm6K";
    }

    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(@RequestBody PaymentRequest paymentRequest) throws StripeException {
        // creare sesiune plata
        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("ron")
                                .setUnitAmount((long) (paymentRequest.getAmount() * 100L))
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName("Rezervare Cabana - " + paymentRequest.getCabinType())
                                                .putMetadata("reservation_id",
                                                        paymentRequest.getReservationId() != null ?
                                                                paymentRequest.getReservationId().toString() : "")
                                                .build()
                                )
                                .build()
                )
                .build();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8081/success.html?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:8081/cancel.html")
                .addLineItem(lineItem)
                .build();

        Session session = Session.create(params);
        Map<String, String> response = new HashMap<>();
        response.put("id", session.getId());
        return response;
    }

    @GetMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestParam String session_id) throws StripeException {
        Session session = Session.retrieve(session_id);

        if ("paid".equals(session.getPaymentStatus())) {
            // extrage id-ul rezervarii
            String reservationId = session.getMetadata().get("reservation_id");

            if (reservationId != null) {
                // marcare rezervare ca platita si trimitere email de confirmare
                return reservationRepository.findById(Integer.parseInt(reservationId))
                        .map(reservation -> {
                            reservation.setPaid(true);
                            reservationRepository.save(reservation);

                            // trimite email de confirmare a platii
                            emailService.sendPaymentConfirmation(
                                    reservation.getEmail(),
                                    reservation.getName(),
                                    reservation.getCheckIn(),
                                    reservation.getCheckOut(),
                                    reservation.getTotalPrice(),
                                    reservation.getPaymentMethod().toString()
                            );

                            return ResponseEntity.ok().build();
                        })
                        .orElse(ResponseEntity.notFound().build());
            }
        }
        return ResponseEntity.badRequest().body("Plata nu a fost confirmată");
    }
    @PostMapping("/{id}/mark-as-paid")
    public ResponseEntity<?> markReservationAsPaid(@PathVariable Integer id) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservation.setPaid(true);
                    reservationRepository.save(reservation);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}