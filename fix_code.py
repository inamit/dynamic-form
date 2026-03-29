import re

def move_fetch(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove the eslint-disable lines we added
    content = content.replace("/* eslint-disable react-compiler/react-compiler */\n", "")
    content = content.replace("/* eslint-disable no-use-before-define */\n", "")

    # Simple regex to move `const fetch... = async () => { ... }` up before `useEffect`
    # This is fragile but works for the specific structures

    # Find all fetch declarations
    fetch_pattern = re.compile(r'(const fetch[a-zA-Z0-9]+ = async \(\) => \{.*?\n  \};\n)', re.DOTALL)
    fetches = fetch_pattern.findall(content)

    if fetches:
        # Remove them from their original spots
        for fetch in fetches:
            content = content.replace(fetch, '')

        # Insert them before useEffect
        use_effect_idx = content.find('useEffect(() => {')
        if use_effect_idx != -1:
            # Go back to the beginning of the line
            line_start = content.rfind('\n', 0, use_effect_idx) + 1
            insertion = ''.join(fetches) + '\n'
            content = content[:line_start] + insertion + content[line_start:]

    with open(filepath, 'w') as f:
        f.write(content)

move_fetch("apps/management-client/src/features/DataSource/DataSourceList.tsx")
move_fetch("apps/management-client/src/features/EntityEditor/EntityForm.tsx")
move_fetch("apps/management-client/src/features/EntityEditor/EntityList.tsx")
