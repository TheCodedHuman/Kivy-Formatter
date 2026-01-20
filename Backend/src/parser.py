from utils import calc_indent, is_widget, parse_datatype

class KVParser:
    def __init__(self, raw_code: str):
        self.lines = raw_code.splitlines()          # Approach used -> Context Map: Indent Level -> The LIST that belongs to that level
        self.root_structure = []                    # We start with a root list that holds the main layout
        self.context = {-1: self.root_structure}    # We initialize it pointing to our root structure

    def parse_kivy(self):
        for line in self.lines:
            if not line.strip(): continue

            indent = calc_indent(line)
            content = line.strip()

            parent_indent = -1                              # Find my Parent's List
            for lvl in sorted(self.context.keys()):         # We look for the closest indent level smaller than the current one
                if lvl < indent:
                    parent_indent = lvl
                else:
                    break
            
            parent_list = self.context[parent_indent]            # This is the list we will either ADD a child to, or UPDATE props in

            # Logic Split: Is it a Widget or a Property?
            if is_widget(content):
                widget_name = content[:-1]                          # Remove colon
                new_widget_list = [{"props": {}}]                   # Initialize the new widget structure: Index 0 is ALWAYS the properties dictionary

                widget_obj = {widget_name: new_widget_list}         # Create the object wrapper { "BoxLayout": [...] }
                parent_list.append(widget_obj)                      # Append this new widget to the parent's list (as a child)

                # Update Context:
                self.context[indent] = new_widget_list              # "Any future lines at this indent (or deeper) belong to THIS widget's list"

                keys_to_del = [k for k in self.context if k > indent]
                for k in keys_to_del: del self.context[k]           # Cleanup: Remove deeper indents so they don't mess up future blocks

            else:
                if ":" in content:
                    key, val = content.split(":", 1)
                    parsed_val = parse_datatype(val)

                    # IMPORTANT: We don't append properties to the list!
                    # We find the 'props' dictionary (Index 0) and update it.
                    parent_list[0]["props"][key.strip()] = parsed_val

        return {"parsed_code": self.root_structure[0] if self.root_structure else {}}
    
    