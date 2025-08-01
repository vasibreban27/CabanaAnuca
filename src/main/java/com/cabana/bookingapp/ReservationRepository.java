package com.cabana.bookingapp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    //original method for backward compatibility
    List<Reservation> findByCheckInLessThanEqualAndCheckOutGreaterThanEqual(
            LocalDate checkOut, LocalDate checkIn);

    //new method that includes cabin type
    List<Reservation> findByCabinTypeAndCheckInLessThanEqualAndCheckOutGreaterThanEqual(
            Reservation.CabinType cabinType, LocalDate checkOut, LocalDate checkIn);
}
