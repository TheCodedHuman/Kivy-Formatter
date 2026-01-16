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
}

// Update on input and sync scrolling
editor.addEventListener("input", updateGutter);
editor.addEventListener("scroll", () => gutter.scrollTop = editor.scrollTop);
editor.addEventListener("paste", () => setTimeout(updateGutter, 0));

// initial render
updateGutter();         // first time rendering

