import toml


def extract_toml(lines):
    # find toml frontmatter if present
    toml_i = []
    for i, line in enumerate(lines):
        if line.strip() == '---':
            toml_i.append(i)

    # toml not found, return empty dict
    if len(toml_i) != 2:
        return lines, {}

    # parse toml fromtmatter
    toml_str = ''
    for i in range(toml_i[0] + 1, toml_i[1]):
        toml_str += lines[i]
        lines[i] = ''

    lines[toml_i[0]] = ''
    lines[toml_i[1]] = ''

    return lines, toml.loads(toml_str)


def parse_toml(lines):
    return [], toml.loads(''.join(lines))
