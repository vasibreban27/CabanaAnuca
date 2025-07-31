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
    public PaymentController(ReservationRepository reservationRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
        Stripe.apiKey = "sk_test_51RnEYgQIGXPdxi2IROwmZqU78rzjUOo2cyoP1Gr2lASIINLPXse7MmshjyOzvQBfjIDHHgCB6ASIrxjY9nKfm2MW00OPHDIm6K";
    }

    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(@RequestBody PaymentRequest paymentRequest) throws StripeException {

        // Build the session params with metadata
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8081/success.html?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:8081/cancel.html");

        // Add metadata for reservation ID
        if (paymentRequest.getReservationId() != null) {
            paramsBuilder.putMetadata("reservation_id", paymentRequest.getReservationId().toString());
        }

        // Create line item
        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("ron")
                                .setUnitAmount((long) (paymentRequest.getAmount() * 100L))
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName("Rezervare Cabana - " + paymentRequest.getCabinType())
                                                .build()
                                )
                                .build()
                )
                .build();

        SessionCreateParams params = paramsBuilder.addLineItem(lineItem).build();
        Session session = Session.create(params);

        Map<String, String> response = new HashMap<>();
        response.put("id", session.getId());
        return response;
    }

    @PostMapping("/send-reservation-email")
    public ResponseEntity<?> sendReservationEmail(@RequestBody Map<String, Integer> request) {
        Integer reservationId = request.get("reservationId");
        if (reservationId == null) {
            return ResponseEntity.badRequest().body("ID rezervare lipsă");
        }

        return reservationRepository.findById(reservationId)
                .map(reservation -> {
                    emailService.sendReservationConfirmation(
                            reservation.getEmail(),
                            reservation.getName(),
                            reservation.getCheckIn(),
                            reservation.getCheckOut(),
                            reservation.isPaid(),
                            reservation.getPaymentMethod()
                    );
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestParam String session_id) {
        try {
            Session session = Session.retrieve(session_id);
            System.out.println("Payment status: " + session.getPaymentStatus());
            System.out.println("Session metadata: " + session.getMetadata());

            if ("paid".equals(session.getPaymentStatus())) {
                // Extract reservation ID from metadata
                String reservationIdStr = session.getMetadata().get("reservation_id");
                System.out.println("Reservation ID from metadata: " + reservationIdStr);

                if (reservationIdStr != null && !reservationIdStr.isEmpty()) {
                    try {
                        Integer reservationId = Integer.parseInt(reservationIdStr);

                        return reservationRepository.findById(reservationId)
                                .map(reservation -> {
                                    // Mark reservation as paid
                                    reservation.setPaid(true);
                                    reservationRepository.save(reservation);

                                    System.out.println("Sending payment confirmation email to: " + reservation.getEmail());

                                    // Send payment confirmation email
                                    try {
                                        emailService.sendPaymentConfirmation(
                                                reservation.getEmail(),
                                                reservation.getName(),
                                                reservation.getCheckIn(),
                                                reservation.getCheckOut(),
                                                reservation.getTotalPrice(),
                                                reservation.getPaymentMethod()
                                        );
                                        System.out.println("Payment confirmation email sent successfully");
                                    } catch (Exception e) {
                                        System.err.println("Error sending payment confirmation email: " + e.getMessage());
                                        e.printStackTrace();
                                    }

                                    return ResponseEntity.ok().body("Plata confirmată și email trimis");
                                })
                                .orElse(ResponseEntity.notFound().build());

                    } catch (NumberFormatException e) {
                        System.err.println("Invalid reservation ID format: " + reservationIdStr);
                        return ResponseEntity.badRequest().body("ID rezervare invalid");
                    }
                } else {
                    System.err.println("No reservation ID found in session metadata");
                    return ResponseEntity.badRequest().body("ID rezervare lipsă din sesiunea de plată");
                }
            } else {
                System.out.println("Payment not completed. Status: " + session.getPaymentStatus());
                return ResponseEntity.badRequest().body("Plata nu a fost finalizată");
            }

        } catch (StripeException e) {
            System.err.println("Stripe error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Eroare la verificarea plății: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("General error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Eroare internă: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/mark-as-paid")
    public ResponseEntity<?> markReservationAsPaid(@PathVariable Integer id) {
        return reservationRepository.findById(id)
                .map(reservation -> {
                    reservation.setPaid(true);
                    reservationRepository.save(reservation);

                    // Also send payment confirmation email when manually marking as paid
                    try {
                        emailService.sendPaymentConfirmation(
                                reservation.getEmail(),
                                reservation.getName(),
                                reservation.getCheckIn(),
                                reservation.getCheckOut(),
                                reservation.getTotalPrice(),
                                reservation.getPaymentMethod()
                        );
                    } catch (Exception e) {
                        System.err.println("Error sending payment confirmation email: " + e.getMessage());
                    }

                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}