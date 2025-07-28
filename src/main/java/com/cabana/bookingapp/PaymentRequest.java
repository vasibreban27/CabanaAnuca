package com.cabana.bookingapp;

public class PaymentRequest {

    private double amount;
    private String cabinType;
    private Integer reservationId;
    private String paymentMethod;

    public PaymentRequest(double amount, String cabinType,Integer id) {
        this.amount = amount;
        this.cabinType = cabinType;
        this.reservationId = id;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCabinType() {
        return cabinType;
    }

    public void setCabinType(String cabinType) {
        this.cabinType = cabinType;
    }

    public void setReservationId(Integer id) {
        this.reservationId = id;
    }
    public Integer getReservationId() {
        return this.reservationId;
    }
}
