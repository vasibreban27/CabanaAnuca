package com.cabana.bookingapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;
    public ReservationController(ReservationRepository reservationRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
    }
    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Map<String, String> requestData) {
        try {
            System.out.println("Request data received: " + requestData);

            if (requestData.get("name") == null || requestData.get("name").isEmpty() ||
                    requestData.get("email") == null || requestData.get("email").isEmpty() ||
                    requestData.get("checkIn") == null || requestData.get("checkIn").isEmpty() ||
                    requestData.get("checkOut") == null || requestData.get("checkOut").isEmpty() ||
                    requestData.get("cabinType") == null || requestData.get("cabinType").isEmpty()) {

                System.out.println("Missing fields detected:");
                requestData.forEach((key, value) ->
                        System.out.println(key + ": " + (value == null ? "null" : value.isEmpty() ? "empty" : value)));

                return ResponseEntity.badRequest().body("Toate câmpurile sunt obligatorii");
            }

            Reservation reservation = new Reservation();
            reservation.setName(requestData.get("name"));
            reservation.setEmail(requestData.get("email"));

            reservation.setPaid(requestData.containsKey("paid") ? Boolean.parseBoolean(requestData.get("paid")) : false);

            if (requestData.containsKey("paymentMethod")) {
                try {
                    reservation.setPaymentMethod(Reservation.PaymentMethod.valueOf(
                            requestData.get("paymentMethod").toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Metodă de plată invalidă. Opțiuni: CASH, CARD");
                }
            } else {
                reservation.setPaymentMethod(Reservation.PaymentMethod.CASH);
            }

            try {
                reservation.setCheckIn(LocalDate.parse(requestData.get("checkIn")));
                reservation.setCheckOut(LocalDate.parse(requestData.get("checkOut")));
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body("Format dată invalid. Folosiți formatul YYYY-MM-DD");
            }

            try {
                String cabinTypeStr = requestData.get("cabinType").toUpperCase();
                reservation.setCabinType(Reservation.CabinType.valueOf(cabinTypeStr));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Tip cabană invalid. Opțiuni: " +
                        Arrays.toString(Reservation.CabinType.values()));
            }

            if (reservation.getCheckIn().isAfter(reservation.getCheckOut())) {
                return ResponseEntity.badRequest().body("Check-in trebuie să fie înainte de check-out");
            }

            List<Reservation> overlapping = reservationRepository
                    .findByCabinTypeAndCheckInLessThanEqualAndCheckOutGreaterThanEqual(
                            reservation.getCabinType(),
                            reservation.getCheckOut(),
                            reservation.getCheckIn()
                    );

            if (!overlapping.isEmpty()) {
                return ResponseEntity.badRequest().body("Cabina nu este disponibilă în perioada selectată");
            }

            long nights = ChronoUnit.DAYS.between(reservation.getCheckIn(), reservation.getCheckOut());
            reservation.setTotalPrice(nights * reservation.getCabinType().getPricePerNight());

            Reservation savedReservation = reservationRepository.save(reservation);

            try {
                emailService.sendReservationConfirmation(
                        savedReservation.getEmail(),
                        savedReservation.getName(),
                        savedReservation.getCheckIn(),
                        savedReservation.getCheckOut(),
                        savedReservation.isPaid(), // Adăugat starea plății în email
                        savedReservation.getPaymentMethod().toString() // Adăugat metoda de plată în email
                );
            } catch (Exception e) {
                System.err.println("Eroare email (necritică): " + e.getMessage());
            }

            return ResponseEntity.ok(savedReservation);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Eroare server: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @GetMapping("/availability")
    public boolean isAvailable(@RequestParam("checkIn") String checkInStr,
                               @RequestParam("checkOut") String checkOutStr,
                               @RequestParam("cabinType") String cabinTypeStr) {
        try {
            var checkIn = java.time.LocalDate.parse(checkInStr);
            var checkOut = java.time.LocalDate.parse(checkOutStr);
            Reservation.CabinType cabinType = Reservation.CabinType.valueOf(cabinTypeStr.toUpperCase());

            return reservationRepository.findByCabinTypeAndCheckInLessThanEqualAndCheckOutGreaterThanEqual(
                    cabinType, checkOut, checkIn
            ).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/price")
    public ResponseEntity<Double> calculatePrice(@RequestParam("checkIn") String checkInStr,
                                                 @RequestParam("checkOut") String checkOutStr,
                                                 @RequestParam("cabinType") String cabinTypeStr) {
        try {
            var checkIn = java.time.LocalDate.parse(checkInStr);
            var checkOut = java.time.LocalDate.parse(checkOutStr);
            var cabinType = Reservation.CabinType.valueOf(cabinTypeStr.toUpperCase());

            long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
            double totalPrice = nights * cabinType.getPricePerNight();

            return ResponseEntity.ok(totalPrice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(0.0);
        }
    }

    @PutMapping("/{id}")
    public Optional<ResponseEntity<Reservation>> updateRepository(@PathVariable  Integer id, @RequestBody Reservation updated){
        return Optional.of(reservationRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setCabinType(updated.getCabinType());
            existing.setCheckIn(updated.getCheckIn());
            existing.setCheckOut(updated.getCheckOut());
            existing.setPaid(updated.isPaid());
            existing.setEmail(updated.getEmail());
            existing.setTotalPrice(updated.getTotalPrice());
            existing.setId(updated.getId());
            existing.setPaymentMethod(updated.getPaymentMethod());
            reservationRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable  Integer id) {
        if(reservationRepository.existsById(id)) {
            reservationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}