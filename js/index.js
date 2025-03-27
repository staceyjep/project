document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "http://localhost:3000/characters"; 

    const characterBar = document.getElementById("character-bar");
    const characterName = document.getElementById("name");
    const characterImage = document.getElementById("image");
    const voteCount = document.getElementById("vote-count");
    const voteForm = document.getElementById("votes-form");
    const voteInput = document.getElementById("votes");
    const resetButton = document.getElementById("reset-btn");
    const ticketList = document.getElementById("ticket-list"); 

    fetch(baseUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(character => {
                const span = document.createElement("span");
                span.textContent = character.name;
                span.style.cursor = "pointer";
                span.addEventListener("click", () => displayCharacter(character));
                characterBar.appendChild(span);
            });

            if (data.length > 0) {
                displayCharacter(data[0]);
                displayTickets(data[0].id); 
            }
        });

    function displayCharacter(character) {
        characterName.textContent = character.name;
        characterImage.src = character.image;
        voteCount.textContent = character.votes;
        displayTickets(character.id); 
    }


    function displayTickets(characterId) {
        fetch(`${baseUrl}/${characterId}/tickets`)
            .then(response => response.json())
            .then(tickets => {
                ticketList.innerHTML = ""; 
                if (tickets && tickets.length > 0) {
                    tickets.forEach(ticket => {
                        const ticketItem = document.createElement("li");
                        ticketItem.textContent = `Ticket: ${ticket.ticketNumber}, Owner: ${ticket.owner}`;
                        ticketList.appendChild(ticketItem);
                    });
                } else {
                    ticketList.textContent = "No tickets available.";
                }
            })
            .catch(error => console.error("Error fetching tickets:", error));
    }

    voteForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const votesToAdd = parseInt(voteInput.value) || 0;
        const currentVotes = parseInt(voteCount.textContent);
        voteCount.textContent = currentVotes + votesToAdd;
        voteInput.value = "";
    });

    resetButton.addEventListener("click", () => {
        voteCount.textContent = "0";
    });
});
const ticketList = document.getElementById("ticket-list");

function displayTickets(characterId) {
    fetch(`<span class="math-inline">\{baseUrl\}/</span>{characterId}/tickets`)
        .then(response => response.json())
        .then(tickets => {
            ticketList.innerHTML = "";
            if (tickets && tickets.length > 0) {
                tickets.forEach(ticket => {
                    const ticketItem = document.createElement("li");
                    ticketItem.textContent = `Ticket: ${ticket.ticketNumber}, Owner: ${ticket.owner}`;
                    ticketList.appendChild(ticketItem);
                });
            } else {
                ticketList.textContent = "No tickets available.";
            }
        })
        .catch(error => console.error("Error fetching tickets:", error));
}