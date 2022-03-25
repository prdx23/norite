from norite.core.Page import Page, Asset


def parsetree(path, root, output):

    if path.is_file():
        if path.suffix == '.md' and path.stem != 'index':
            return Page(path, root, output)

        if path.suffix != '.md' and path.name not in Page._base_names:
            return Asset(path, root, output)

    if path.is_dir():
        children = list(path.iterdir())
        inner = [parsetree(x, root, output) for x in children]

        index = [x for x in children if x.name in Page._base_names]
        if index:
            return Page(index[0], root, output, inner)

        return Page(path, root, output, inner)


def printtree(section, indent=0):

    if section.is_asset:
        # print(' ' * indent, f'[{section.permalink}]: ', end='')
        # print(section.path.name)
        print(' ' * indent, section.path)
        return

    print(' ' * indent, f'[{section.permalink}]: ', end='')
    print(section.path)
    # print(' ' * indent, f'[{section.permalink}] ', end='')
    # print(' ' * indent, f'[]: ', end='')
    # print('parent:', section.parent, '  - ', section.path)
    # print(' ' * indent, section.path)
    # print(' ' * indent, 'template: ', section.template)
    # print(' ' * indent, 'child_template: ', section.child_template)
    # print(' ' * indent, 'parent: ', section.parent)
    # print(' ' * indent, 'permalink: ', section.permalink)
    # print(' ' * indent, 'sections: ', section.sections)
    # print(' ' * indent, 'assets: ', section.assets)
    # print(' ' * indent, 'root: ', section.root)
    # print()

    [printtree(x, indent + 4) for x in section.sections]
    [printtree(x, indent + 4) for x in section.assets]
