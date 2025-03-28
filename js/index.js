document.addEventListener("DOMContentLoaded", function() {

    const TICKETS_API = "http://localhost:3005/events";
    const BOOKINGS_API = "http://localhost:3005/bookings";
    
    const rallyList = document.getElementById("rally-list");
    const rallySelect = document.getElementById("rally-select");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const ticketsInput = document.getElementById("tickets");
    const bookButton = document.getElementById("book-button");
    const addRallyButton = document.getElementById("add-rally-button");
    const updateRallyButton = document.getElementById("update-rally-button");
    const deleteRallyButton = document.getElementById("delete-rally-button");
    const ticketList = document.getElementById("ticket-list");
    const newRallyName = document.getElementById("new-rally-name");
    
    function initApp() {
        loadRallies();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        bookButton.addEventListener("click", handleBooking);
        addRallyButton.addEventListener("click", addRally);
        updateRallyButton.addEventListener("click", updateRally);
        deleteRallyButton.addEventListener("click", deleteRally);
        rallySelect.addEventListener("change", function() {
            if (this.value) loadBookings(this.value);
        });
    }
    
    async function loadRallies() {
        try {
            const response = await fetch(TICKETS_API);
            if (!response.ok) throw new Error("Failed to fetch rallies");
            
            const rallies = await response.json();
            renderRallies(rallies);
            populateRallySelect(rallies);
            
            if (rallies.length > 0) loadBookings(rallies[0].id);
        } catch (error) {
            console.error("Error loading rallies:", error);
            showAlert("Failed to load rally events", "error");
        }
    }
    
    async function loadBookings(rallyId) {
        try {
            const response = await fetch(`${BOOKINGS_API}?rallyId=${rallyId}`);
            if (!response.ok) throw new Error("Failed to fetch bookings");
            
            renderBookings(await response.json());
        } catch (error) {
            console.error("Error loading bookings:", error);
            showAlert("Failed to load bookings", "error");
        }
    }
    
    function renderRallies(rallies) {
        rallyList.innerHTML = '';
        
        if (rallies.length === 0) {
            rallyList.innerHTML = '<div class="empty-state">No rally events available</div>';
            return;
        }
    
        rallies.forEach(rally => {
            const rallyCard = document.createElement('div');
            rallyCard.className = 'rally-card';
            rallyCard.innerHTML = `
                <h3><i class="fas fa-flag-checkered"></i> ${rally.name}</h3>
                <p><i class="fas fa-calendar-day"></i> ${rally.date||"Date TBD"}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${rally.location||"Various locations"}</p>
                <button class="btn btn-secondary" data-id="${rally.id}">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
            `;
            rallyList.appendChild(rallyCard);
        });
    }
    
    function populateRallySelect(rallies) {
        rallySelect.innerHTML = '<option value="">-- Choose a rally event --</option>';
        
        rallies.forEach(rally => {
            const option = document.createElement('option');
            option.value = rally.id;
            option.textContent = rally.name;
            rallySelect.appendChild(option);
        });
    }
    
    function renderBookings(bookings) {
        ticketList.innerHTML = '';
        
        if (bookings.length === 0) {
            ticketList.innerHTML = '<li class="empty-booking">No bookings yet for this event</li>';
            return;
        }
    
        bookings.forEach(booking => {
            const bookingItem = document.createElement('li');
            bookingItem.className = 'booking-item';
            bookingItem.innerHTML = `
                <div class="booking-header">
                    <span class="booking-name">${booking.name}</span>
                    <span class="booking-tickets">${booking.tickets} ticket(s)</span>
                </div>
                <div class="booking-email">${booking.email}</div>
            `;
            ticketList.appendChild(bookingItem);
        });
    }
    
    async function handleBooking() {
        const rallyId = rallySelect.value;
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const tickets = parseInt(ticketsInput.value);
    
        if (!validateBookingForm(rallyId, name, email, tickets)) return;
    
        try {
            const response = await fetch(BOOKINGS_API, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({rallyId, name, email, tickets})
            });
            
            if (!response.ok) throw new Error("Booking failed");
            
            await response.json();
            showAlert("Booking successful!","success");
            nameInput.value = "";
            emailInput.value = "";
            ticketsInput.value = "1";
            loadBookings(rallyId);
        } catch (error) {
            console.error("Booking error:", error);
            showAlert("Failed to create booking","error");
        }
    }
    
    async function addRally() {
        const name = newRallyName.value.trim();
        if (!name) return showAlert("Please enter a rally name","warning");
    
        try {
            const response = await fetch(TICKETS_API, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    name,
                    date: new Date().toISOString().split("T")[0],
                    location: "Kenya"
                })
            });
            
            if (!response.ok) throw new Error("Failed to add rally");
            
            await response.json();
            showAlert("Rally added successfully!","success");
            newRallyName.value = "";
            loadRallies();
        } catch (error) {
            console.error("Add rally error:", error);
            showAlert("Failed to add rally","error");
        }
    }
    
    async function updateRally() {
        const rallyId = rallySelect.value;
        const name = newRallyName.value.trim();
        if (!rallyId || !name) return showAlert("Please select a rally and enter a new name","warning");
    
        try {
            const response = await fetch(`${TICKETS_API}/${rallyId}`, {
                method: "PUT",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({name})
            });
            
            if (!response.ok) throw new Error("Failed to update rally");
            
            showAlert("Rally updated successfully!","success");
            newRallyName.value = "";
            loadRallies();
        } catch (error) {
            console.error("Update rally error:", error);
            showAlert("Failed to update rally","error");
        }
    }
    
    async function deleteRally() {
        const rallyId = rallySelect.value;
        if (!rallyId) return showAlert("Please select a rally to delete","warning");
        if (!confirm("Are you sure you want to delete this rally? All associated bookings will also be deleted.")) return;
    
        try {
            const bookingsResponse = await fetch(`${BOOKINGS_API}?rallyId=${rallyId}`);
            if (bookingsResponse.ok) {
                const bookings = await bookingsResponse.json();
                for (const booking of bookings) {
                    await fetch(`${BOOKINGS_API}/${booking.id}`, {method: "DELETE"});
                }
            }
    
            const response = await fetch(`${TICKETS_API}/${rallyId}`, {method: "DELETE"});
            if (!response.ok) throw new Error("Failed to delete rally");
            
            showAlert("Rally deleted successfully!","success");
            loadRallies();
            rallySelect.value = "";
            nameInput.value = "";
            emailInput.value = "";
            ticketsInput.value = "1";
        } catch (error) {
            console.error("Delete rally error:", error);
            showAlert("Failed to delete rally","error");
        }
    }
    
    function validateBookingForm(rallyId, name, email, tickets) {
        if (!rallyId) return showAlert("Please select a rally event","warning"), false;
        if (!name) return showAlert("Please enter your name","warning"), false;
        if (!email || !email.includes("@")) return showAlert("Please enter a valid email","warning"), false;
        if (!tickets || tickets < 1) return showAlert("Please enter at least 1 ticket","warning"), false;
        return true;
    }
    
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.classList.add("fade-out");
            setTimeout(() => alertDiv.remove(), 500);
        }, 3000);
    }
    
    initApp();
    
    });
    