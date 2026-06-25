with open('frontend/src/pages/admin/AddProductWizard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_line = 2157
content = "".join(lines[target_line-1:])
# We want to find the matching brace/parenthesis for the `{` at the start of line 2080
# Let's count braces and parentheses starting from the `{`
brace_count = 0
paren_count = 0
in_string = False
string_char = None
escape = False

for idx, char in enumerate(content):
    if escape:
        escape = False
        continue
    if char == '\\':
        escape = True
        continue
    if in_string:
        if char == string_char:
            in_string = False
        continue
    if char in ['"', "'", '`']:
        in_string = True
        string_char = char
        continue
    
    if char == '{':
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0:
            print(f"Brace closed at relative char index {idx}, line {target_line + content[:idx].count(chr(10))}")
            # Print surrounding content
            print("Surrounding lines:")
            matched_line_idx = target_line - 1 + content[:idx].count('\n')
            for i in range(max(0, matched_line_idx - 5), min(len(lines), matched_line_idx + 6)):
                print(f"{i+1}: {lines[i]}", end="")
            break
