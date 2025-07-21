// Configurări pentru aplicație
const CONFIG = {
    API_BASE_URL: 'http://localhost:8081/api', // Ajustează conform backend-ului tău
    PRICE_PER_NIGHT: 150 // Lei per noapte
};

// Inițializare aplicație
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    setupFormValidation();
});

// Inițializare pagină
function initializePage() {
    // Setează data minimă pentru rezervare (astăzi)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').min = today;
    document.getElementById('checkOut').min = today;
}

// Event Listeners
function setupEventListeners() {
    // Date picker events
    document.getElementById('checkIn').addEventListener('change', handleCheckInChange);
    document.getElementById('checkOut').addEventListener('change', calculatePrice);

    // Form submission
    document.getElementById('reservation-form').addEventListener('submit', handleFormSubmission);
}

// Gestionarea schimbării datei de check-in
function handleCheckInChange() {
    const checkInDate = new Date(this.value);
    const checkOutInput = document.getElementById('checkOut');

    // Setează data minimă pentru check-out (o zi după check-in)
    checkInDate.setDate(checkInDate.getDate() + 1);
    checkOutInput.min = checkInDate.toISOString().split('T')[0];

    // Calculează prețul
    calculatePrice();
}

// Calculul prețului
function calculatePrice() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const priceDisplay = document.getElementById('price-display');

    if (checkIn && checkOut) {
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        if (nights > 0) {
            const totalPrice = nights * CONFIG.PRICE_PER_NIGHT;
            priceDisplay.value = `${totalPrice} LEI (${nights} ${nights === 1 ? 'noapte' : 'nopți'})`;
        } else {
            priceDisplay.value = 'Datele nu sunt valide';
        }
    } else {
        priceDisplay.value = '';
    }
}

// Validarea formularului
function setupFormValidation() {
    const form = document.getElementById('reservation-form');
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Validarea unui câmp individual
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Validare în funcție de tipul câmpului
    switch(field.type) {
        case 'email':
            if (!isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Vă rugăm să introduceți un email valid';
            }
            break;
        case 'date':
            if (!isValidDate(field)) {
                isValid = false;
                errorMessage = 'Data selectată nu este validă';
            }
            break;
        default:
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Acest câmp trebuie să aibă cel puțin 2 caractere';
            }
    }

    // Afișează sau ascunde eroarea
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

// Validarea email-ului
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validarea datei
function isValidDate(dateField) {
    const selectedDate = new Date(dateField.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateField.id === 'checkIn') {
        return selectedDate >= today;
    } else if (dateField.id === 'checkOut') {
        const checkInDate = new Date(document.getElementById('checkIn').value);
        return selectedDate > checkInDate;
    }

    return true;
}

// Afișarea erorii pentru un câmp
function showFieldError(field, message) {
    clearFieldError(field);

    field.style.borderColor = '#dc3545';
    field.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.3)';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.marginTop = '0.5rem';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

// Curățarea erorii pentru un câmp
function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';

    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Gestionarea trimiterii formularului
async function handleFormSubmission(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    //const responseDiv = document.getElementById('response');

    // Validează toate câmpurile
    const requiredFields = form.querySelectorAll('input[required]');
    let isFormValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        showResponse('Vă rugăm să corectați erorile din formular.', 'error');
        return;
    }

    // Afișează loading state
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Se procesează...';
    submitBtn.disabled = true;

    try {
        // Colectează datele din formular
        const formData = new FormData(form);
        const reservationData = {
            name: formData.get('name'),
            email: formData.get('email'),
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            cabinType: formData.get('cabinType')
        };

        console.log('Sending reservation data:', reservationData);

        // Trimite datele la server
        const response = await fetch(`${CONFIG.API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reservationData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.ok) {
            const result = await response.json();
            console.log('Success result:', result);
            showResponse(`Rezervarea a fost înregistrată cu succes! Numărul rezervării: ${result.id || 'N/A'}`, 'success');
            form.reset();
            document.getElementById('price-display').value = '';
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            showResponse(`Eroare la procesarea rezervării: ${errorText}`, 'error');
        }

    } catch (error) {
        console.error('Network error:', error);
        showResponse('A apărut o eroare la procesarea rezervării. Vă rugăm să încercați din nou.', 'error');
    } finally {
        // Restaurează butonul
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Afișarea mesajului de răspuns
function showResponse(message, type) {
    const responseDiv = document.getElementById('response');
    if (!responseDiv) return;

    responseDiv.className = `response ${type}`;
    responseDiv.textContent = message;
    responseDiv.style.display = 'block';
    responseDiv.style.padding = '1rem';
    responseDiv.style.borderRadius = '8px';
    responseDiv.style.marginTop = '1rem';
    responseDiv.style.fontSize = '1rem';
    responseDiv.style.fontWeight = '500';

    if (type === 'success') {
        responseDiv.style.backgroundColor = '#d4edda';
        responseDiv.style.color = '#155724';
        responseDiv.style.border = '1px solid #c3e6cb';
    } else {
        responseDiv.style.backgroundColor = '#f8d7da';
        responseDiv.style.color = '#721c24';
        responseDiv.style.border = '1px solid #f5c6cb';
    }

    // Ascunde mesajul după 5 secunde
    setTimeout(() => {
        responseDiv.style.display = 'none';
    }, 5000);

    // Scroll către mesaj
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
// Calculează prețul total pentru trimitere
// function calculateTotalPrice() {
//     const checkIn = document.getElementById('checkIn').value;
//     const checkOut = document.getElementById('checkOut').value;
//     //const guests = document.getElementById('guests').value;
//     if (checkIn && checkOut) {
//         const startDate = new Date(checkIn);
//         const endDate = new Date(checkOut);
//         const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
//         return nights > 0 ? nights * CONFIG.PRICE_PER_NIGHT : 0;
//     }
//
//     return 0;
// }
// Smooth scrolling pentru navigație
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animații pe scroll
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Header background pe scroll
function setupHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Funcții utilitare
const Utils = {
    // Formatează data pentru afișare
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Formatează numărul de telefon
    formatPhone: function(phone) {
        // Implementează formatarea pentru numărul de telefon românesc
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    },

    // Debounce pentru optimizarea performanței
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export pentru utilizare în alte fișiere (dacă este necesar)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        Utils,
        calculatePrice,
        validateField,
        isValidEmail,
        isValidDate
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');

            // Close all other FAQs
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });

            // Toggle current FAQ if it wasn't active
            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
    });

    // Form submission handling (example)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Here you would normally send the form data to your server
            // For demo purposes, we'll just show the success message
            const successMessage = this.querySelector('.response-message.success');
            successMessage.style.display = 'block';

            // Reset form after 3 seconds
            setTimeout(() => {
                this.reset();
                successMessage.style.display = 'none';
            }, 3000);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Team member photos - replace with actual images
    const teamMembers = [
        {
            name: "Alexandra Pop",
            photo: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            name: "Marian Ionescu",
            photo: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            name: "Elena Dumitrescu",
            photo: "https://randomuser.me/api/portraits/women/68.jpg"
        }
    ];

    const teamCards = document.querySelectorAll('.team-card');

    teamCards.forEach((card, index) => {
        const photoDiv = card.querySelector('.team-photo');
        if (teamMembers[index]) {
            // Replace the placeholder with actual image
            photoDiv.innerHTML = '';
            photoDiv.style.backgroundImage = `url(${teamMembers[index].photo})`;
            photoDiv.style.backgroundSize = 'cover';
            photoDiv.style.backgroundPosition = 'center';
        }

        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
        this.querySelector('i').classList.toggle('fa-bars');
    });

    // Sticky Header
    const header = document.querySelector('.sticky-header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Hero Slider
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Auto slide change every 5 seconds
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);

    // Testimonials Slider
    const testimonials = document.querySelectorAll('.testimonial');
    let currentTestimonial = 0;

    function showTestimonial(n) {
        testimonials.forEach(testimonial => testimonial.classList.remove('active'));
        currentTestimonial = (n + testimonials.length) % testimonials.length;
        testimonials[currentTestimonial].classList.add('active');
    }

    // Auto testimonial change every 7 seconds
    setInterval(() => {
        showTestimonial(currentTestimonial + 1);
    }, 7000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                    mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                }
            }
        });
    });

    // Gallery item click handler (would open a lightbox in a real implementation)
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', function() {
            // In a real implementation, this would open a lightbox with the full image
            console.log('Opening gallery image:', this.style.backgroundImage);
        });
    });
});


// Functie pentru deschiderea albumului
function openAlbum(albumId) {
    // Ascunde toate albumele
    const albums = document.querySelectorAll('.album');
    albums.forEach(album => {
        album.classList.remove('active');
    });

    // Arata albumul selectat
    document.getElementById(albumId + '-album').classList.add('active');

    // Opțional: blochează scroll-ul pe pagina principală
    document.body.style.overflow = 'hidden';
}

// Functie pentru inchiderea albumului
function closeAlbum() {
    // Ascunde toate albumele
    const albums = document.querySelectorAll('.album');
    albums.forEach(album => {
        album.classList.remove('active');
    });

    // Reactivează scroll-ul pe pagina principală
    document.body.style.overflow = 'auto';
}

// Închide albumul când se apasă în afara conținutului
window.onclick = function(event) {
    const albums = document.querySelectorAll('.album');
    albums.forEach(album => {
        if (event.target === album) {
            closeAlbum();
        }
    });
}

function selectCabin(cabinType) {
    const select = document.getElementById('cabinType');
    select.value = cabinType;

    // Update visual selection
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-cabin-type="${cabinType}"]`).classList.add('selected');

    // Scroll to form
    document.getElementById('reservation-form').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    // Update price if dates are selected
    updatePriceAndAvailability();
}

// Price calculation and availability check
function updatePriceAndAvailability() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const cabinType = document.getElementById('cabinType').value;
    const nightsDisplay = document.getElementById('nights-display');
    const priceDisplay = document.getElementById('price-display');
    const availabilityMessage = document.getElementById('availability-message');

    if (!checkIn || !checkOut || !cabinType) {
        nightsDisplay.value = '';
        priceDisplay.value = '';
        availabilityMessage.innerHTML = '';
        return;
    }

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        nightsDisplay.value = '';
        priceDisplay.value = '';
        availabilityMessage.innerHTML = '<div class="error-message">Data de check-out trebuie să fie după data de check-in</div>';
        return;
    }

    nightsDisplay.value = nights + (nights === 1 ? ' noapte' : ' nopți');

    // Check availability and calculate price
    const params = new URLSearchParams({
        checkIn: checkIn,
        checkOut: checkOut,
        cabinType: cabinType
    });

    // Check availability
    fetch(`/api/reservations/availability?${params}`)
        .then(response => response.json())
        .then(available => {
            if (available) {
                availabilityMessage.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Disponibil pentru perioada selectată</div>';

                // Get price
                fetch(`/api/reservations/price?${params}`)
                    .then(response => response.json())
                    .then(price => {
                        priceDisplay.value = price + ' LEI';
                    })
                    .catch(error => {
                        console.error('Error calculating price:', error);
                        priceDisplay.value = 'Eroare la calcularea prețului';
                    });
            } else {
                availabilityMessage.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Nu este disponibil pentru perioada selectată</div>';
                priceDisplay.value = 'Indisponibil';
            }
        })
        .catch(error => {
            console.error('Error checking availability:', error);
            availabilityMessage.innerHTML = '<div class="error-message">Eroare la verificarea disponibilității</div>';
        });
}

// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').setAttribute('min', today);
    document.getElementById('checkOut').setAttribute('min', today);
});

// Event listeners
document.getElementById('checkIn').addEventListener('change', function() {
    // Set minimum checkout date to the day after checkin
    const checkInDate = new Date(this.value);
    checkInDate.setDate(checkInDate.getDate() + 1);
    const minCheckOut = checkInDate.toISOString().split('T')[0];
    document.getElementById('checkOut').setAttribute('min', minCheckOut);

    updatePriceAndAvailability();
});

document.getElementById('checkOut').addEventListener('change', updatePriceAndAvailability);
document.getElementById('cabinType').addEventListener('change', updatePriceAndAvailability);

// // Form submission
// document.getElementById('reservation-form').addEventListener('submit', function(e) {
//     e.preventDefault();
//
//     const formData = new FormData(this);
//     const reservation = {
//         name: formData.get('name'),
//         email: formData.get('email'),
//         checkIn: formData.get('checkIn'),
//         checkOut: formData.get('checkOut'),
//         cabinType: formData.get('cabinType')
//     };
//
//     const responseDiv = document.getElementById('response');
//     responseDiv.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Se procesează rezervarea...</div>';
//
//     fetch('/api/reservations', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(reservation)
//     })
//         .then(response => {
//             if (!response.ok) {
//                 return response.text().then(text => {
//                     throw new Error(text);
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             responseDiv.innerHTML = `
//             <div class="success-message">
//                 <i class="fas fa-check-circle"></i>
//                 Rezervarea a fost trimisă cu succes!<br>
//                 <strong>Numărul rezervării:</strong> ${data.id}<br>
//                 <strong>Preț total:</strong> ${data.totalPrice} LEI
//             </div>
//         `;
//             this.reset();
//             document.getElementById('price-display').value = '';
//             document.getElementById('nights-display').value = '';
//             document.getElementById('availability-message').innerHTML = '';
//
//             // Remove visual selection
//             document.querySelectorAll('.pricing-card').forEach(card => {
//                 card.classList.remove('selected');
//             });
//         })
//         .catch(error => {
//             responseDiv.innerHTML = `
//             <div class="error-message">
//                 <i class="fas fa-exclamation-triangle"></i>
//                 ${error.message}
//             </div>
//         `;
//         });
// });


document.getElementById("pay-button").addEventListener("click", async function () {
    const stripe = Stripe("pk_test_51RnEYgQIGXPdxi2IlzbuVWo7ZxxCJT63vwRlm92LBAKg3fYd0oaYOCxmQvzXJk0d5lT2HOFBYRiy9FEZ54knFstk00xjkEkz2L"); // publishable key

    const amount = parseFloat(document.getElementById("price-display").value);
    const cabinType = document.getElementById("cabinType").value;

    const response = await fetch("http://localhost:8081/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            amount: amount,
            cabinType: cabinType
        })
    });

    const session = await response.json();
    const result = await stripe.redirectToCheckout({
        sessionId: session.id
    });

    if (result.error) {
        alert(result.error.message);
    }
});
