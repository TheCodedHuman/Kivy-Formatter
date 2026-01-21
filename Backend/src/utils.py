# utils.py
from kivy.lang.parser import Parser, ParserException
from typing import Any

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Validation ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
def validate_kv(text: str) -> bool:
    try:
        Parser(content=text)
        return True
    except ParserException:
        try:
            # Fallback: try cleaning paths/strings
            processed = get_processed_kv_code(text)
            Parser(content=processed)
            return True
        except:
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PreProcessing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
def preprocess(text: str) -> list[str]:
    lines = text.splitlines()
    safe_lines = []
    for line in lines:
        if "'" in line or '"' in line:
            line = line.replace("\\", "/")      # Fix Windows paths

        if line.strip():                        # For parsing logic, skipping empty lines is safer.
            safe_lines.append(line)
    return safe_lines

def get_processed_kv_code(text: str) -> str:
    return "\n".join(preprocess(text))


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Parsing Helpers ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def calc_indent(line: str) -> int:      # returns raw number of spaces (e.g., 4, 8, 12)
    return len(line) - len(line.lstrip())

def is_widget(content: str) -> bool:    # Checks if line ends with ':' and isn't a property like 'size_hint: 54'
    return content.endswith(":")

def parse_datatype(val: str) -> Any:
    """Tries to coerce a datatype on the value received else returns same string value"""
    val = val.strip()
    if val.isdigit(): return int(val)
    
    try: return float(val)
    except ValueError: pass
    
    if "[" in val or "," in val:                                                # Lists/Tuples
        clean = val.replace("[", "").replace("]", "")
        return [parse_datatype(v) for v in clean.split(",") if v.strip()]       # Recursively parse items in list
        
    return val.strip("'\"")

