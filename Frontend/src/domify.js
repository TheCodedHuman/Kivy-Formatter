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

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};


// Recursive renderer
function renderNode(label, value, depth = 0, path = "") {
    const nodePath = path ? `${path}/${label}` : label;
    const isOpen = state[nodePath] || false; // Default closed
    const indentStep = window.innerWidth < 768 ? 20 : 70;

    // --- TYPE CHECKING ---
    const isArray = Array.isArray(value);
    const isObject = typeof value === "object" && value !== null && !isArray;

    // --- HIDE EMPTY PROPS ---
    if (label === "props" && isObject && Object.keys(value).length === 0) {
        return "";
    }

    // If it's a primitive (string/number/null), just show it
    if (!isArray && !isObject) {
        return `
        <div class="node-row" style="padding-left: ${depth * indentStep}px">
            <span class="key">${label}: </span> 
            <span class="value type-${typeof value}">${value}</span>
        </div>`;
    }

    // --- RENDER PARENT NODE ---
    const isProps = label === "props";                                          // Helper boolean
    const icon = isProps ? "⚙️" : (isOpen ? "▾" : "▸");                         // Choose Icon
    const labelClass = isProps ? "props-label" : "widget-label";                // Choose Label Class
    const iconClass = isProps ? "toggle-icon gear-icon" : "toggle-icon";        // Choose Icon Class (Add 'gear-icon' only for props)

    let html = `
    <div class="node-wrapper">
        <div class="node-row hover-effect" 
             style="padding-left: ${depth * indentStep}px" 
             onclick="toggle('${nodePath}')">
             
            <span class="${iconClass}">${icon}</span>
            
            <strong class="${labelClass}">${escapeHtml(label)}</strong>
        </div>
    `;

    if (isOpen) {
        if (isArray) {
            value.forEach((item, index) => {
                if (typeof item === "object" && item !== null) {
                    const [childKey, childVal] = Object.entries(item)[0];
                    const arrayItemPath = `${nodePath}[${index}]`;
                    html += renderNode(childKey, childVal, depth + 1, arrayItemPath);
                }
            });
        } else {
            for (const [key, val] of Object.entries(value)) {
                html += renderNode(key, val, depth + 1, nodePath);
            }
        }
    }

    html += `</div>`;
    return html;
};