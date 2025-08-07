
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const currentPage = window.location.pathname.split('/').pop();

    if (!isAuthenticated && currentPage !== 'login.html') {
        window.location.href = 'login.html';
        return false;
    }

    if (isAuthenticated && currentPage === 'login.html') {
        window.location.href = 'dashboard.html';
        return false;
    }

    return true;
}

function logout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    window.location.href = 'login.html';
}

function setupLoginPage() {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }

    if (loginForm) {
        const validCredentials = {
            username: "admin",
            password: "Anuca2025!"
        };

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Resetează mesajele de eroare
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }

            if (username === validCredentials.username && password === validCredentials.password) {
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('username', username);
                window.location.href = "dashboard.html";
            } else if (errorMessage) {
                errorMessage.textContent = "Nume de utilizator sau parolă incorectă!";
                errorMessage.style.display = 'block';
            }
        });
    }
}

function loadDashboardData() {
    fetch('/api/reservations/stats')
        .then(res => res.json())
        .then(data => {
            updateStats(data.stats);
            updateRecentReservations(data.recentReservations);
            updateNotifications(data.notifications);
        })
        .catch(error => {
            console.error('Eroare la încărcarea datelor:', error);
        });
}

function updateStats(stats) {
    const activeEl = document.getElementById('activeReservations');
    const incomeEl = document.getElementById('monthlyIncome');
    const rateEl = document.getElementById('occupancyRate');

    if (activeEl) activeEl.textContent = stats.activeReservations;
    if (incomeEl) incomeEl.textContent = `${stats.monthlyIncome}€`;
    if (rateEl) rateEl.textContent = `${stats.occupancyRate}%`;
}

function updateRecentReservations(reservations) {
    const tbody = document.querySelector('#recentReservations tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.name}</td>
            <td>${reservation.cabinType}</td>
            <td>${formatDate(reservation.checkIn)}</td>
            <td>${formatDate(reservation.checkOut)}</td>
            <td><span class="status ${getStatusClass(reservation)}">${getStatusText(reservation)}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function updateNotifications(notifications) {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    list.innerHTML = '';

    notifications.forEach(notification => {
        const item = document.createElement('li');
        item.innerHTML = `
            <i class="fas ${getNotificationIcon(notification.type)}"></i>
            <span>${notification.message}</span>
            <small>${formatTimeAgo(notification.timestamp)}</small>
        `;
        list.appendChild(item);
    });
}
function loadReservations() {
    fetch("/api/reservations")
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            const tbody = document.querySelector("#reservations-table tbody");
            if (!tbody) return;

            tbody.innerHTML = "";

            if (data.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="9" style="text-align: center;">Nu există rezervări</td>`;
                tbody.appendChild(row);
                return;
            }

            data.forEach(r => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${r.id}</td>
                    <td><input type="text" value="${r.name || ''}" data-id="${r.id}" data-field="name" /></td>
                    <td><input type="email" value="${r.email || ''}" data-id="${r.id}" data-field="email" /></td>
                    <td><input type="date" value="${r.checkIn || ''}" data-id="${r.id}" data-field="checkIn" /></td>
                    <td><input type="date" value="${r.checkOut || ''}" data-id="${r.id}" data-field="checkOut" /></td>
                    <td><input type="text" value="${r.cabinType || ''}" data-id="${r.id}" data-field="cabinType" /></td>
                    <td><input type="number" value="${r.totalPrice || ''}" data-id="${r.id}" data-field="totalPrice" /></td>
                    <td>
                        <select data-id="${r.id}" data-field="paymentMethod">
                            <option value="cash" ${r.paymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
                            <option value="card" ${r.paymentMethod === 'card' ? 'selected' : ''}>Card</option>
                            <option value="transfer" ${r.paymentMethod === 'transfer' ? 'selected' : ''}>Transfer bancar</option>
                        </select>
                    </td>
                    <td>
                        <input type="checkbox" ${r.paid ? 'checked' : ''} data-id="${r.id}" data-field="paid" />
                    </td>
                    <td>
                        <button class="btn btn-save" onclick="updateReservation(${r.id})">Salvează</button>
                        <button class="btn btn-delete" onclick="deleteReservation(${r.id})">Șterge</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading reservations:', error);
            const tbody = document.querySelector("#reservations-table tbody");
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: red;">Eroare la încărcarea rezervărilor</td></tr>`;
            }
        });
}

window.updateReservation = function(id) {
    const updated = {
        id: id,
        name: document.querySelector(`input[data-id="${id}"][data-field="name"]`).value,
        email: document.querySelector(`input[data-id="${id}"][data-field="email"]`).value,
        checkIn: document.querySelector(`input[data-id="${id}"][data-field="checkIn"]`).value,
        checkOut: document.querySelector(`input[data-id="${id}"][data-field="checkOut"]`).value,
        cabinType: document.querySelector(`input[data-id="${id}"][data-field="cabinType"]`).value,
        totalPrice: parseFloat(document.querySelector(`input[data-id="${id}"][data-field="totalPrice"]`).value),
        paymentMethod: document.querySelector(`select[data-id="${id}"][data-field="paymentMethod"]`).value,
        paid: document.querySelector(`input[data-id="${id}"][data-field="paid"]`).checked
    };

    fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    })
        .then(res => {
            if (!res.ok) throw new Error('Update failed');
            return res.json();
        })
        .then(data => {
            alert("Rezervare actualizată cu succes!");
            loadReservations();
        })
        .catch(error => {
            console.error('Eroare actualizare:', error);
            alert("Eroare la actualizare: " + error.message);
        });
};

window.deleteReservation = function(id) {
    if (!confirm("Ești sigur că vrei să ștergi această rezervare?")) return;

    fetch(`/api/reservations/${id}`, { method: "DELETE" })
        .then(res => {
            if (res.ok) {
                alert("Rezervare ștearsă cu succes!");
                loadReservations();
            } else {
                throw new Error('Delete failed');
            }
        })
        .catch(error => {
            console.error('Error deleting reservation:', error);
            alert("Eroare la ștergere!");
        });
};

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `acum ${minutes} min`;
    if (minutes < 1440) return `acum ${Math.floor(minutes/60)} ore`;
    return `acum ${Math.floor(minutes/1440)} zile`;
}

function getStatusClass(reservation) {
    const now = new Date();
    const checkOut = new Date(reservation.checkOut);

    if (reservation.cancelled) return 'cancelled';
    if (checkOut < now) return 'completed';
    return 'confirmed';
}

function getStatusText(reservation) {
    const status = getStatusClass(reservation);
    switch(status) {
        case 'cancelled': return 'Anulată';
        case 'completed': return 'Finalizată';
        default: return 'Confirmată';
    }
}

function getNotificationIcon(type) {
    switch(type) {
        case 'reservation': return 'fa-calendar-plus';
        case 'review': return 'fa-star';
        case 'payment': return 'fa-money-bill-wave';
        default: return 'fa-bell';
    }
}
document.addEventListener('DOMContentLoaded', function() {

    if (checkAuth()) {

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        if (document.querySelector('#reservations-table')) {
            loadReservations();
        }

        if (document.querySelector('.dashboard-page')) {
            loadDashboardData();
            setInterval(loadDashboardData, 30000);

            const refreshBtn = document.getElementById('refreshBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', loadDashboardData);
            }
        }
    }

    setupLoginPage();

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
});