package com.cabana.bookingapp;

import com.stripe.exception.StripeException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
public class BookingIntegrationTest {

    @Autowired
    private PaymentController paymentController;

    private ReservationRepository reservationRepository;

    @Test
    public void createReservationAndPayment_Success() throws StripeException {
        // Given
        Reservation reservation = new Reservation();
        reservation.setId(1);
        reservation.setPaid(false);
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        PaymentRequest request = new PaymentRequest(150, "STANDARD", 1);
        Map<String, String> response = paymentController.createCheckoutSession(request);

        // Then
        assertNotNull(response.get("id"));
    }
}