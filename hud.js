// EXCALIBUR HUD v1.02b - Production Pulse
const HUD_REFRESH_RATE = 10000; // 10-second heartbeat
const myNodeID = "04"; // Change this to test different characters (01-15)

async function updateHUD() {
    try {
        console.log("PULSE: Requesting Archive Handshake...");
        
        // Fetching directly from the root manifest
        const response = await fetch('./manifest.json');
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        const currentRound = data.current_live_round;
        // Accessing the character name from the assignments array
        const nodeName = data.assignments[myNodeID][0]; 
        const nodeBase = data.library[nodeName];
        const schedule = data.round_schedule[currentRound][nodeName];

        // 1. Update Identity & Bio
        document.getElementById('player-role').innerText = nodeName.replace('NODE_', '');
        document.getElementById('player-bio').innerText = nodeBase.bio;

        // 2. Update Motives for the Current Round
        let motiveHTML = "";
        if (schedule && schedule.motives) {
            schedule.motives.forEach(m => {
                motiveHTML += `<li>${m}</li>`;
            });
        } else {
            motiveHTML = "<li>AWAITING UPDATED COMMANDS...</li>";
        }
        document.getElementById('motive-list').innerHTML = motiveHTML;

        // 3. The Ledger Reveal Logic
        const ledger = document.getElementById('quest-ledger');
        if (data.ledger_visibility === "VISIBLE") {
            ledger.style.display = "block";
            ledger.classList.add('glitch-animate');
            renderQuestLedger(data);
        } else {
            ledger.style.display = "none";
        }

        // 4. Update System Status
        document.getElementById('system-status').innerText = `${data.system_status} // ROUND ${currentRound}`;

        console.log(`SYNC COMPLETE // NODE: ${nodeName} // ROUND: ${currentRound}`);
    } catch (e) {
        console.error("CONNECTION ERROR:", e);
        document.getElementById('system-status').innerText = "CONNECTION LOST // RECONNECTING...";
    }
}

// Logic to build the shared Ledger when the Admin reveals it
function renderQuestLedger(data) {
    const currentRound = data.current_live_round;
    const schedule = data.round_schedule[currentRound];
    let html = "<h3>THE RESTORED CHRONICLE</h3><ul>";

    for (let node in schedule) {
        const cleanName = node.replace('NODE_', '');
        html += `<li><strong>${cleanName}:</strong> ${schedule[node].motives[0]}</li>`;
    }
    document.getElementById('quest-list').innerHTML = html + "</ul>";
}

// Start the Pulse
updateHUD();
setInterval(updateHUD, HUD_REFRESH_RATE);
