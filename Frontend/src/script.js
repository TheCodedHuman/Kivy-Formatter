// tab-insertin logic
document.getElementById("editor-text").addEventListener("keydown", function(e) {
    if (e.key == "Tab") {
        e.preventDefault();     // stop focus shifting

        // selection
        const textarea = this;  
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // insertion
        const spaces = "    ";
        textarea.value = textarea.value.substring(0, start) + spaces + textarea.value.substring(end) 
        
        // cursor re-positioning
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
    };
});


// line-number updation logic
const gutter = document.getElementById("gutter");
const editor = document.getElementById("editor-text");

function updateGutter() {
    const lines = Math.max(1, editor.value.split("\n").length);
    gutter.value = "";         // clears previous line-number
    
    let s = "";
    for (let i = 1; i <= lines; i++) s += i + "\n";
    gutter.value = s;

    // Digit Calculation
    const digits = lines.toString().length;
    gutter.style.width = `calc(${digits}ch + 1rem)`;
}

// Update on input and sync scrolling
editor.addEventListener("input", updateGutter);
editor.addEventListener("scroll", () => gutter.scrollTop = editor.scrollTop);
editor.addEventListener("paste", () => setTimeout(updateGutter, 0));

// initial render
updateGutter();         // first time rendering


// magic-btn functionality
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("magic-btn");
    const editor = document.getElementById("editor-text");
    const output = document.getElementById("formatted-output");         // tree output
    const outputContainer = document.getElementById("formatted-code");  // container

    button.addEventListener("click", async () => {
        const rawCode = editor.value;

        try {
            // const response = await fetch("http://127.0.0.1:8000/format", {                   // dev
            const response = await fetch("https://kivy-formatter.onrender.com/format", {        // prod
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ raw_code: rawCode })
            });
            if (!response.ok) throw new Error(`Server Error: ${response.status}`);

            const data = await response.json();
            window.data = data;
            render()
            outputContainer.style.overflow = "auto";            // Restore scrollbar just in case it was hidden by a previous error
            outputContainer.style.padding = "1rem 0";           // Restore breathing room for code

        } catch (error) {
            console.error("Error:", error);                 // Inject HTML with a specific class we will style in CSS
            outputContainer.style.overflow = "hidden";      // Hide scrollbar so the error message 
            outputContainer.style.padding = "0";            // Remove padding so it centers perfectly
            output.innerHTML = `<div class="error-msg">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Something went wrong :(</h3>
                    <p>Frontend Side</p>
                    <small>${error.message}</small>
                </div>`;
        }

    })
});


