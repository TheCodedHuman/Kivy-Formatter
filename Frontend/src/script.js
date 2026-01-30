// -------------------- 1. Tab Insertion Logic --------------------
document.getElementById("editor-text").addEventListener("keydown", function (e) {
    if (e.key == "Tab") {
        e.preventDefault();     // stop focus shifting

        const textarea = this;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Save scroll position before editing
        const scrollTop = textarea.scrollTop;

        // Insertion
        const spaces = "    "; // 4 standard spaces
        textarea.value = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);

        // Cursor re-positioning
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;

        // Restore scroll position
        textarea.scrollTop = scrollTop;
    };
});


// -------------------- 2. Line Number (Gutter) Logic --------------------
const gutter = document.getElementById("gutter");
const editor = document.getElementById("editor-text");

function updateGutter() {
    const lines = Math.max(1, editor.value.split("\n").length);

    // Save scroll position
    const currentScroll = gutter.scrollTop;

    let s = "";
    for (let i = 1; i <= lines; i++) s += i + "\n";
    gutter.value = s;

    // Restore scroll position
    gutter.scrollTop = currentScroll;

    // Dynamic Width
    const digits = lines.toString().length;
    gutter.style.width = `calc(${digits}ch + 1rem)`;
}

// -------------------- 3. Scroll Sync & Event Listeners --------------------

// Sync Gutter scroll with Editor scroll
editor.addEventListener("scroll", () => {
    gutter.scrollTop = editor.scrollTop;
});

editor.addEventListener("input", updateGutter);
editor.addEventListener("paste", () => setTimeout(updateGutter, 0));

// Initial render
updateGutter();


// -------------------- 4. Magic Button & Output Logic --------------------
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("magic-btn");
    const editor = document.getElementById("editor-text");
    const output = document.getElementById("formatted-output");         // tree output
    const outputContainer = document.getElementById("formatted-code");  // container

    button.addEventListener("click", async () => {
        const rawCode = editor.value;

        // Reset padding for loading state
        outputContainer.style.padding = "1rem 0";

        try {
            // const response = await fetch("http://127.0.0.1:8000/format", {                   // dev
            const response = await fetch("https://kivy-formatter-backend.azurewebsites.net/format", {        // prod
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ raw_code: rawCode })
            });

            // --- IMPROVED ERROR HANDLING ---
            if (!response.ok) {
                // Check if it is a Syntax Error (422)
                if (response.status === 422) {
                    throw new Error("Invalid Kivy Syntax. Please check your code.");
                }

                // Check if Server is asleep/down (500, 502, 503)
                if (response.status >= 500) {
                    throw new Error("Server is sleeping or down. Try again in 1 min.");
                }

                // Generic fallback
                throw new Error(`Server Error: ${response.status}`);
            }
            // -------------------------------

            const data = await response.json();
            window.data = data;
            render();

            // SUCCESS STATE:
            outputContainer.style.overflow = "auto";
            outputContainer.style.padding = "1rem 0";

        } catch (error) {
            console.error("Error:", error);

            // ERROR STATE:
            outputContainer.style.overflow = "hidden";
            outputContainer.style.padding = "0";

            output.innerHTML = `<div class="error-msg">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Parsing Failed</h3>
                    <p style="opacity: 0.7; margin-bottom: 0.5rem">The Formatter could not read your code.</p>
                    <small style="color: #ff6b6b; border: 1px solid #ff4757; padding: 0.5rem; border-radius: 0.5rem; background: rgba(255, 71, 87, 0.1);">
                        ${error.message}
                    </small>
                </div>`;
        }
    })
});

