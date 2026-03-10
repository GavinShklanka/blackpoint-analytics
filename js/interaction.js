document.addEventListener("DOMContentLoaded", () => {
    // Check if the user has already seen the popup in this session
    if (!sessionStorage.getItem("blackpoint_visited")) {
        // Create the popup element
        const popup = document.createElement("div");
        popup.className = "interaction-overlay";
        popup.innerHTML = `
            <button class="interaction-close" aria-label="Close">&times;</button>
            <div class="interaction-content">
                <p>"Most AI systems predict outcomes.</p>
                <p>Few systems govern decisions.</p>
                <p class="muted">Blackpoint explores the architecture behind those decisions."</p>
            </div>
            <div class="interaction-actions">
                <button id="interaction-explore">Explore the Architecture</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Show it after a short delay
        setTimeout(() => {
            popup.classList.add("visible");
        }, 1500);

        // Dismiss logic
        const dismissPopup = () => {
            popup.classList.remove("visible");
            sessionStorage.setItem("blackpoint_visited", "true");
            setTimeout(() => {
                popup.remove();
            }, 500);
        };

        popup.querySelector(".interaction-close").addEventListener("click", dismissPopup);
        
        popup.querySelector("#interaction-explore").addEventListener("click", () => {
            dismissPopup();
            // Go to lab.html if exploring architecture
            if(!window.location.href.includes("lab.html")) {
                window.location.href = "lab.html";
            }
        });
    }
});
