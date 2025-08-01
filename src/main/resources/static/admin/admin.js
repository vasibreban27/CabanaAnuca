document.addEventListener('DOMContentLoaded', function() {

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form handling logic here
            alert('Form submitted!');
        });
    });

    const statusElements = document.querySelectorAll('.status');
    statusElements.forEach(el => {
        const status = el.textContent.toLowerCase();
        el.classList.add(status);
    });
});