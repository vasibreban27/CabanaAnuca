package com.cabana.bookingapp;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    public PaymentController() {
        Stripe.apiKey = "sk_test_51RnEYgQIGXPdxi2IROwmZqU78rzjUOo2cyoP1Gr2lASIINLPXse7MmshjyOzvQBfjIDHHgCB6ASIrxjY9nKfm2MW00OPHDIm6K"; // cheia secretă
    }

    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(@RequestBody PaymentRequest paymentRequest) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8081/success.html")
                .setCancelUrl("http://localhost:8081/cancel.html")
                .addLineItem(
                        SessionCreateParams.LineItem.builder().setQuantity(1L)
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
                                .build()
                )
                .build();

        Session session = Session.create(params);
        Map<String, String> response = new HashMap<>();
        response.put("id", session.getId());
        return response;
    }
}
