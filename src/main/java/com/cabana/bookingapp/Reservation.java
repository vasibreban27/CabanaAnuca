package com.cabana.bookingapp;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String email;
    private LocalDate checkIn;
    private LocalDate checkOut;
    @Enumerated(EnumType.STRING)
    private CabinType cabinType;
    private Double totalPrice;
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    private Boolean paid = false;

    public enum PaymentMethod {
        CASH, CARD
    }
    public enum CabinType {
        STANDARD(150.0, "Cabana Standard"),
        FAMILIE(200.0, "Cabana Familie"),
        DELUXE(250.0, "Cabana Deluxe");

        private final Double pricePerNight;
        private final String displayName;

        CabinType(Double pricePerNight, String displayName) {
            this.pricePerNight = pricePerNight;
            this.displayName = displayName;
        }

        public Double getPricePerNight() {
            return pricePerNight;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public Reservation() {}
    public Reservation(Integer id, String name, String email, LocalDate checkIn, LocalDate checkOut,CabinType cabinType) throws ReservationException {
        if(checkIn.isAfter(checkOut)) {
            throw new ReservationException("Check in date cannot be after check out date");
        }
        this.id = id;
        this.name = name;
        this.email = email;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.cabinType = cabinType;
        this.totalPrice = calculateTotalPrice();
    }

    public Double calculateTotalPrice(){
        if(checkIn!=null && checkOut!=null && cabinType!=null) {
            long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
            return nights * cabinType.getPricePerNight();
        }
        return 0.0;
    }
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }

    public CabinType getCabinType() {
        return cabinType;
    }
    public void setCabinType(CabinType cabinType) {
        this.cabinType = cabinType;
    }
    public Double getTotalPrice() {
        return totalPrice;
    }
    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
    public Boolean getPaid(){
        return paid;
    }
    public void setPaid(Boolean paid) {
        this.paid = paid;
    }

    public String getPaymentMethod() {
        return paymentMethod.toString();
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    public boolean isPaid(){
        return paid;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Reservation that = (Reservation) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(name, that.name) &&
                Objects.equals(email, that.email) &&
                Objects.equals(checkIn, that.checkIn) &&
                Objects.equals(checkOut, that.checkOut) &&
                Objects.equals(cabinType, that.cabinType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, email, checkIn, checkOut,cabinType);
    }

    @Override
    public String toString() {
        return "Reservation{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", checkIn=" + checkIn +
                ", checkOut=" + checkOut +
                ", cabinType=" + cabinType +
                ", totalPrice=" + totalPrice +
                ", isPaid=" + paid +
                ", paymentMethod=" + paymentMethod +
                '}';
    }
}
