import json         # helps just to load, and not to dump, as app will handle that
from typing import Any

class KVParser:
    def __init__(self, raw_code: str):
        self.lines = raw_code.splitlines()
        self.root: dict[str, Any] = {}      # this will return
        self.stack: list[tuple[int, dict[str, Any]]] = [(0, self.root)]       # (indent_level, current_dict)    


    def parse_kivy(self) -> dict[str, dict]:
        """this is the main function that returns json ultimately to frontend"""
        for line in self.lines:
            if not line.strip(): continue           # if empty line

            indent = self.count_indent(line)
            key_val: list[str] = line.strip().split(":",maxsplit=1)     # 2 strings will come for eg, ['BoxLayout', '']

            if len(key_val) == 1:                           # BoxLayout: will come (basically widgets having nothing after ':' symbol)
                key: str = key_val[0].strip()
                node = {}

                # attach to correct parent
                while self.stack and self.stack[-1][0] >= indent:
                    self.stack.pop()
                self.stack[-1][1][key] = node
                self.stack.append((indent, node))

            else:
                key, val = key_val      # both content of key_val will get distributed to key and value
                self.stack[-1][1][key.strip()] = self.parse_datatype(val.strip())

        return { "raw_text": self.root }


    def count_indent(self, line: str) -> int:
        """Counts leading spaces to determine nesting level from the 'line' it recieves"""
        return len(line) - len(line.lstrip())
    

    def parse_datatype(self, val: str) -> Any:  # by default everything is string in raw_code
        """Try to coerce into int, float, list, dict, else string."""

        if val.isdigit(): return int(val)       # Integer

        try: return float(val)                  # Float
        except ValueError: pass

        if "," in val:
            return [self.parse_datatype(v.strip()) for v in val.split(",")]      # returns tuple values like height: (30, 20)
        
        if val.startswith("{") and val.endswith("}"):
            try:
                json.loads(val.replace("'", '"'))
            except Exception:
                return val
        
        return val.strip("'\"")     # ' → is only there, else is just escape sequence 
        
    