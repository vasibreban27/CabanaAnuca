package com.cabana.bookingapp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    //original method for backward compatibility
    List<Reservation> findByCheckInLessThanEqualAndCheckOutGreaterThanEqual(
            LocalDate checkOut, LocalDate checkIn);

    //new method that includes cabin type
    List<Reservation> findByCabinTypeAndCheckInLessThanEqualAndCheckOutGreaterThanEqual(
            Reservation.CabinType cabinType, LocalDate checkOut, LocalDate checkIn);

    List<Reservation> findByCheckInBetween(LocalDate start, LocalDate end);

    List<Reservation> findTop5ByOrderByCheckInDesc();

    @Query("SELECT r FROM Reservation r WHERE r.cabinType = :cabinType " +
            "AND r.checkIn <= :checkOut AND r.checkOut >= :checkIn")
    List<Reservation> findByCabinTypeAndDateRange(
            @Param("cabinType") Reservation.CabinType cabinType,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);
}
