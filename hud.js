// hud.js - EXCALIBUR v1.02 (API & Round Schedule Edition)
const HUD_REFRESH_RATE = 10000; // 10-second heartbeat
const myNodeID = "01"; // Example: This player is The Hammer. Change per device.

async function updateHUD() {
    try {
        // Fetch from the API, not the raw JSON, to ensure fresh data
        const response = await fetch('excalibur_api.php');
        const data = await response.json();
        
        const currentRound = data.current_live_round;
        // Since assignments are arrays like ["NODE_HAMMER"], we grab index 0
        const nodeName = data.assignments[myNodeID][0]; 
        const nodeBase = data.library[nodeName];
        const schedule = data.round_schedule[currentRound][nodeName];

        // 1. Update Identity
        document.getElementById('player-role').innerText = nodeName.replace('NODE_', '');
        document.getElementById('player-bio').innerText = nodeBase.bio;

        // 2. Update Motives for the Current Round
        let motiveHTML = "";
        schedule.motives.forEach(m => {
            motiveHTML += `<li>${m}</li>`;
        });
        document.getElementById('motive-list').innerHTML = motiveHTML;

        // 3. The "Oh Crap" Ledger Reveal
        const ledger = document.getElementById('quest-ledger');
        if (data.ledger_visibility === "VISIBLE") {
            ledger.style.display = "block";
            ledger.classList.add('glitch-animate');
            renderQuestLedger(data);
        }

        // 4. Update System Status
        document.getElementById('system-status').innerText = `${data.system_status} // ROUND ${currentRound}`;

        console.log(`HUD SYNC v1.02 // NODE: ${nodeName} // ROUND: ${currentRound}`);
    } catch (e) {
        console.error("HUD SYNC ERROR // REALITY COLLAPSE", e);
        document.getElementById('system-status').innerText = "CONNECTION LOST // RECONNECTING...";
    }
}

function renderQuestLedger(data) {
    const currentRound = data.current_live_round;
    const schedule = data.round_schedule[currentRound];
    let html = "<h3>THE RESTORED CHRONICLE</h3><ul>";

    // Loop through all nodes active in the current round schedule
    for (let node in schedule) {
        const cleanName = node.replace('NODE_', '');
        html += `<li><strong>${cleanName}:</strong> ${schedule[node].motives[0]}</li>`;
    }
    document.getElementById('quest-list').innerHTML = html + "</ul>";
}

// Initialize Pulse
setInterval(updateHUD, HUD_REFRESH_RATE);
updateHUD();
