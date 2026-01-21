// Literals
const state = {};       // Stores { "root/BoxLayout": true, ... }


// Render utils
function render() {
    // Pass the raw data. "parsed_code" is usually the top-level key from the API
    const rootData = window.data.parsed_code || window.data;
    const container = document.getElementById("formatted-output");
    container.innerHTML = "";       // clears previous render

    // Start recursion
    for (const [key, val] of Object.entries(rootData)) {
        container.innerHTML += renderNode(key, val, 0, "root");
    }
};

window.toggle = function(nodePath) {
    state[nodePath] = !state[nodePath]      // toggles in true or false
    render();
};


// Recursive renderer
function renderNode(label, value, depth = 0, path = "") {
    const nodePath = path ? `${path}/${label}` : label;
    const isOpen = state[nodePath] || false; // Default closed

    // --- TYPE CHECKING ---
    const isArray = Array.isArray(value);
    const isObject = typeof value === "object" && value !== null && !isArray;

    // If it's a primitive (string/number/null), just show it
    if (!isArray && !isObject) {
        return `
        <div class="node-row" style="padding-left: ${depth * 20}px">
            <span class="key">${label}:</span> 
            <span class="value type-${typeof value}">${value}</span>
        </div>`;
    }

    // --- RENDER PARENT NODE ---
    // If it's "props", we might want a different icon, e.g., ⚙️
    const icon = label === "props" ? "⚙️" : (isOpen ? "▾" : "▸");
    const labelClass = label === "props" ? "props-label" : "widget-label";

    let html = `
    <div class="node-wrapper">
        <div class="node-row hover-effect" 
             style="padding-left: ${depth * 30}px" 
             onclick="toggle('${nodePath}')">
            <span class="toggle-icon">${icon}</span>
            <strong class="${labelClass}">${label}</strong>
        </div>
    `;

    // --- RENDER CHILDREN (If Open) ---
    if (isOpen) {
        if (isArray) {
            // SPECIAL HANDLING FOR KIVY LISTS
            // The list contains objects like [{props}, {Child1}, {Child2}]
            // We iterate the list, but we don't render the INDEX. 
            // We dig inside the object to find the Key.

            value.forEach((item, index) => {
                if (typeof item === "object" && item !== null) {
                    // Each item in your Kivy JSON is a dict with ONE key 
                    // e.g. { "Button": [...] } or { "props": {...} }
                    const [childKey, childVal] = Object.entries(item)[0];

                    // Generate a unique path for array items so toggling works
                    const arrayItemPath = `${nodePath}[${index}]`;

                    html += renderNode(childKey, childVal, depth + 1, arrayItemPath);
                }
            });

        } else {
            // STANDARD OBJECT HANDLING (like inside "props")
            for (const [key, val] of Object.entries(value)) {
                html += renderNode(key, val, depth + 1, nodePath);
            }
        }
    }

    html += `</div>`;
    return html;
};

