
const CONFIG = {
    API_BASE_URL: 'http://localhost:8081/api',
    PRICE_PER_NIGHT: 150
};

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    setupFormValidation();
});

function initializePage() {
    //set minim date for reservation
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').min = today;
    document.getElementById('checkOut').min = today;
}

function setupEventListeners() {
    //date picker events
    document.getElementById('checkIn').addEventListener('change', handleCheckInChange);
    document.getElementById('checkOut').addEventListener('change', calculatePrice);

    document.getElementById('reservation-form').addEventListener('submit', handleFormSubmission);
}

function handleCheckInChange() {
    const checkInDate = new Date(this.value);
    const checkOutInput = document.getElementById('checkOut');

    // set minim date for check out
    checkInDate.setDate(checkInDate.getDate() + 1);
    checkOutInput.min = checkInDate.toISOString().split('T')[0];

    calculatePrice();
}

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

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

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

    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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

function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';

    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

async function handleFormSubmission(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');

    const requiredFields = form.querySelectorAll('input[required], select[required]');
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

    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Se procesează...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData(form);
        const reservationData = {
            name: formData.get('name'),
            email: formData.get('email'),
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            cabinType: formData.get('cabinType'),
            paid: false,
            paymentMethod: "CASH"
        };

        console.log('Sending reservation data:', reservationData);

        // send data to server
        const response = await fetch(`${CONFIG.API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reservationData)
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('Success result:', result);

            const successMessage = reservationData.paymentMethod === "CASH"
                ? `Rezervarea a fost înregistrată cu succes! Numărul rezervării: ${result.id || 'N/A'}. Veți plăti la fața locului.`
                : `Rezervarea a fost înregistrată cu succes! Numărul rezervării: ${result.id || 'N/A'}`;

            showResponse(successMessage, 'success');
            form.reset();
            document.getElementById('price-display').value = '';

            document.querySelectorAll('.pricing-card').forEach(card => {
                card.classList.remove('selected');
            });
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            showResponse(`Eroare la procesarea rezervării: ${errorText}`, 'error');
        }

    } catch (error) {
        console.error('Network error:', error);
        showResponse('A apărut o eroare la procesarea rezervării. Vă rugăm să încercați din nou.', 'error');
    } finally {
        // reset buttons
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

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

    setTimeout(() => {
        responseDiv.style.display = 'none';
    }, 5000);

    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

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


const Utils = {

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },


    formatPhone: function(phone) {
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    },

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
//for export
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
function selectCabin(cabinType) {
    const select = document.getElementById('cabinType');
    select.value = cabinType;

    document.querySelectorAll('.pricing-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-cabin-type="${cabinType}"]`).classList.add('selected');

    document.getElementById('reservation-form').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    updatePriceAndAvailability();
}
document.addEventListener('DOMContentLoaded', function() {
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

            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
    });

//send contact message
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const form = e.target;
            const submitBtn = form.querySelector('.submit-btn');
            const successMessage = form.querySelector('.response-message.success');
            const errorMessage = form.querySelector('.response-message.error');

            // hide any previous messages
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';

            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#dc3545';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) {
                errorMessage.textContent = 'Vă rugăm să completați toate câmpurile obligatorii.';
                errorMessage.style.display = 'block';
                return;
            }

            const formData = {
                name: form.querySelector('#name').value,
                email: form.querySelector('#email').value,
                subject: form.querySelector('#subject').value,
                message: form.querySelector('#message').value
            };

            //show loading state
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite...';

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const responseData = await response.json();

                if (response.ok) {
                    successMessage.style.display = 'block';
                    form.reset();
                } else {
                    throw new Error(responseData.message || 'Eroare la trimiterea mesajului');
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = `Eroare: ${error.message}`;
                errorMessage.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                //hide messages after 3 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    errorMessage.style.display = 'none';
                }, 3000);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
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
                photoDiv.innerHTML = '';
                photoDiv.style.backgroundImage = `url(${teamMembers[index].photo})`;
                photoDiv.style.backgroundSize = 'cover';
                photoDiv.style.backgroundPosition = 'center';
            }

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    });


    document.addEventListener('DOMContentLoaded', function() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-times');
            this.querySelector('i').classList.toggle('fa-bars');
        });

        const header = document.querySelector('.sticky-header');

        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        const slides = document.querySelectorAll('.slide');
        let currentSlide = 0;

        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);

        const testimonials = document.querySelectorAll('.testimonial');
        let currentTestimonial = 0;

        function showTestimonial(n) {
            testimonials.forEach(testimonial => testimonial.classList.remove('active'));
            currentTestimonial = (n + testimonials.length) % testimonials.length;
            testimonials[currentTestimonial].classList.add('active');
        }

        setInterval(() => {
            showTestimonial(currentTestimonial + 1);
        }, 7000);

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

                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                    }
                }
            });
        });

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function() {
                console.log('Opening gallery image:', this.style.backgroundImage);
            });
        });
    });


    window.onclick = function(event) {
        const albums = document.querySelectorAll('.album');
        albums.forEach(album => {
            if (event.target === album) {
                closeAlbum();
            }
        });
    }

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

        //calculate nights
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

        const params = new URLSearchParams({
            checkIn: checkIn,
            checkOut: checkOut,
            cabinType: cabinType
        });

        fetch(`/api/reservations/availability?${params}`)
            .then(response => response.json())
            .then(available => {
                if (available) {
                    availabilityMessage.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Disponibil pentru perioada selectată</div>';

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

    document.addEventListener('DOMContentLoaded', function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkIn').setAttribute('min', today);
        document.getElementById('checkOut').setAttribute('min', today);
    });

    document.getElementById('checkIn').addEventListener('change', function() {
        const checkInDate = new Date(this.value);
        checkInDate.setDate(checkInDate.getDate() + 1);
        const minCheckOut = checkInDate.toISOString().split('T')[0];
        document.getElementById('checkOut').setAttribute('min', minCheckOut);

        updatePriceAndAvailability();
    });

    document.getElementById('checkOut').addEventListener('change', updatePriceAndAvailability);
    document.getElementById('cabinType').addEventListener('change', updatePriceAndAvailability);

    //pay button functionality for reservations
    document.getElementById("pay-button").addEventListener("click", async function (e) {
        e.preventDefault();

        const requiredFields = document.querySelectorAll('#reservation-form input[required], #reservation-form select[required]');
        let isFormValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            showResponse('Vă rugăm să corectați erorile din formular înainte de plată.', 'error');
            return;
        }

        const formData = new FormData(document.getElementById('reservation-form'));
        const checkIn = new Date(formData.get('checkIn'));
        const checkOut = new Date(formData.get('checkOut'));
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        let pricePerNight;
        switch(formData.get('cabinType')) {
            case 'STANDARD': pricePerNight = 150; break;
            case 'FAMILIE': pricePerNight = 200; break;
            case 'DELUXE': pricePerNight = 250; break;
            default: pricePerNight = 150;
        }
        const totalPrice = nights * pricePerNight;

        const reservationData = {
            name: formData.get('name'),
            email: formData.get('email'),
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            cabinType: formData.get('cabinType'),
            totalPrice: totalPrice,
            paid: false,
            paymentMethod: "CARD"
        };

        const payBtn = document.getElementById("pay-button");
        const originalBtnText = payBtn.innerHTML;
        payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se procesează...';
        payBtn.disabled = true;

        try {
            const reservationResponse = await fetch(`${CONFIG.API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            if (!reservationResponse.ok) {
                const errorText = await reservationResponse.text();
                throw new Error(`Eroare la crearea rezervării: ${errorText}`);
            }

            const reservation = await reservationResponse.json();


            const stripe = Stripe("pk_test_51RnEYgQIGXPdxi2IlzbuVWo7ZxxCJT63vwRlm92LBAKg3fYd0oaYOCxmQvzXJk0d5lT2HOFBYRiy9FEZ54knFstk00xjkEkz2L");

            const paymentResponse = await fetch(`${CONFIG.API_BASE_URL}/payment/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: totalPrice,
                    cabinType: reservationData.cabinType,
                    reservationId: reservation.id,
                    paymentMethod: "CARD"
                })
            });

            if (!paymentResponse.ok) {
                const errorText = await paymentResponse.text();
                throw new Error(`Eroare la inițierea plății: ${errorText}`);
            }

            const session = await paymentResponse.json();

            const result = await stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

        } catch (error) {
            console.error('Payment error:', error);
            showResponse(`Eroare la procesarea plății: ${error.message}`, 'error');

        } finally {
            if (!window.location.href.includes('checkout.stripe.com')) {
                payBtn.innerHTML = originalBtnText;
                payBtn.disabled = false;
            }
        }
    });
})

function openAlbum(albumId) {
    const albums = document.querySelectorAll('.album');
    albums.forEach(album => {
        album.classList.remove('active');
    });

    document.getElementById(albumId + '-album').classList.add('active');

    document.body.style.overflow = 'hidden';
}


function closeAlbum() {
    const albums = document.querySelectorAll('.album');
    albums.forEach(album => {
        album.classList.remove('active');
    });

    document.body.style.overflow = 'auto';
}

const animateOnScroll = () => {
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });
};

const initHeroSlider = () => {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        slides[currentSlide].classList.add('active');

        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }
};

const initTestimonialSlider = () => {
    const testimonials = document.querySelectorAll('.testimonial');
    let currentTestimonial = 0;

    if (testimonials.length > 0) {
        testimonials[currentTestimonial].classList.add('active');

        setInterval(() => {
            testimonials[currentTestimonial].classList.remove('active');
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].classList.add('active');
        }, 8000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    initHeroSlider();
    initTestimonialSlider();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
        fetch(`${CONFIG.API_BASE_URL}/payment/verify-payment?session_id=${sessionId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Eroare la verificarea plății');
                }
                return response.json();
            })
            .then(data => {
                console.log('Payment verification result:', data);
            })
            .catch(error => {
                console.error('Error verifying payment:', error);
            });
    }
});