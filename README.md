# CabanaAnuca
1. Project Description
  This project is a website for presenting a cabin resort (CabanaAnuca). It uses Spring Boot for the backend, MySql for database and HTML, CSS, and JavaScript for the frontend. Key features include:

  Cabin showcase pages
  
  Stripe Checkout for payments
  
  Automatic email notifications for payment and reservation confirmations
  
  Contact section with embedded Google Maps
  
  Virtual chatbot for additional info
  
2. Technologies Used
   
  Backend: Spring Boot

  Frontend: HTML, CSS, JavaScript
  
  Database: MySQL
  
  Payments: Stripe Checkout
  
  Email: email-sending service (e.g., SMTP, JavaMail)
  
  Maps: Google Maps

3. Installation and Configuration
   
   3.1 Clone the repo on your local machine:
      git clone https://github.com/vasibreban27/CabanaAnuca.git
      cd CabanaAnuca
   
   3.2 Configure the application
     --for Stripe
           stripe.api.key=API_KEY
           stripe.webhook.secret=WEBHOOK_SECRET
   
     --for Email
          spring.mail.host=smtp.example.com
          spring.mail.port=587
          spring.mail.username=USERNAME
          spring.mail.password=PASSWORD
          spring.mail.properties.mail.smtp.auth=true
          spring.mail.properties.mail.smtp.starttls.enable=true
   
     --for MySql
          spring.datasource.url=jdbc:mysql://localhost:3306/database_name
          spring.datasource.username=USERNAME
          spring.datasource.password=PASSWORD
          spring.jpa.hibernate.ddl-auto=update
     --for Google Maps
         google.maps.api.key=API_KEY
   
     --run the app : ./mvnw spring-boot:run


4. Usage
  Browse the cabin showcase pages

  Select a cabin and complete the reservation form
  
  Proceed with payment through Stripe Checkout
  
  Receive an email confirmation for your reservation/payment
  
  Use the Contact section to view the location on a map and send messages
  

5. Future Improvements
   -Better Email Templates – Use HTML email templates for better styling and branding.
   
   -Responsive Design – Ensure the frontend is mobile-friendly, especially for payment and booking pages.
   
   -Caching & Performance – Cache frequently accessed data (e.g., cabin listings) to improve performance.
   
   -Unit & Integration Tests – Add automated tests for main features like reservations and payments
   
   -Add an english version for the frontend
   
   -Better security and data validation - Store API keys, DB credentials, and SMTP passwords in environment variables or a secure configuration service.
   
