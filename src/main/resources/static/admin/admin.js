document.addEventListener('DOMContentLoaded', function () {
    //sidebar toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    //load reservations
    function loadReservations() {
        fetch("/api/reservations")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                const tbody = document.querySelector("#reservations-table tbody");
                if (!tbody) return;

                tbody.innerHTML = ""; // Clear old rows

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

    //update reservation
    window.updateReservation = function (id) {
        const inputs = document.querySelectorAll(`[data-id="${id}"]`);
        const updated = { id: id };

        inputs.forEach(input => {
            if (input.tagName === 'INPUT') {
                if (input.type === 'checkbox') {
                    updated[input.dataset.field] = input.checked;
                } else {
                    updated[input.dataset.field] = input.value;
                }
            } else if (input.tagName === 'SELECT') {
                updated[input.dataset.field] = input.value;
            }
        });

        fetch(`/api/reservations/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updated)
        })
            .then(res => {
                if (res.ok) {
                    alert("Rezervare actualizată cu succes!");
                    loadReservations();
                } else {
                    throw new Error('Update failed');
                }
            })
            .catch(error => {
                console.error('Error updating reservation:', error);
                alert("Eroare la actualizare!");
            });
    };

    //delete reservation
    window.deleteReservation = function (id) {
        if (!confirm("Ești sigur că vrei să ștergi această rezervare?")) return;

        fetch(`/api/reservations/${id}`, {
            method: "DELETE"
        })
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

    //call on load
    loadReservations();
});