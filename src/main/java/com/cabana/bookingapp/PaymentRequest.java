package com.cabana.bookingapp;

public class PaymentRequest {

    private double amount;
    private String cabinType;

    public PaymentRequest(double amount, String cabinType) {
        this.amount = amount;
        this.cabinType = cabinType;
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
}
