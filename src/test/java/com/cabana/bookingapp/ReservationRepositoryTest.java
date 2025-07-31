package com.cabana.bookingapp;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class ReservationRepositoryTest {

    @Autowired
    private ReservationRepository reservationRepository;

    @Test
    public void saveReservation_Success() {
        // Given
        Reservation.CabinType cabinType = Reservation.CabinType.valueOf("STANDARD");
        Reservation reservation = new Reservation();
        reservation.setName("Test");
        reservation.setEmail("test@example.com");
        reservation.setCheckIn(LocalDate.now());
        reservation.setCheckOut(LocalDate.now().plusDays(2));
        reservation.setCabinType(cabinType);

        // When
        Reservation savedReservation = reservationRepository.save(reservation);

        // Then
        assertNotNull(savedReservation.getId());
        assertEquals("Test", savedReservation.getName());
    }
}