"""
viz_networkx.py

Creates a simple hierarchical graph of module names using networkx+matplotlib.
This is a fallback visualization if Graphviz/dot fails to render.
"""
from torchvision import models
import networkx as nx
import matplotlib.pyplot as plt


def build_graph_from_module_names(names):
    G = nx.DiGraph()
    for name in names:
        parts = name.split('.')
        for i in range(1, len(parts) + 1):
            node = '.'.join(parts[:i])
            parent = '.'.join(parts[:i-1]) if i > 1 else None
            if not G.has_node(node):
                G.add_node(node)
            if parent:
                if not G.has_node(parent):
                    G.add_node(parent)
                if not G.has_edge(parent, node):
                    G.add_edge(parent, node)
    return G


def main():
    m = models.resnet18(pretrained=False)
    names = [n for n, _ in m.named_modules() if n != '']
    G = build_graph_from_module_names(names)

    # Try to use graphviz layout if available, else fallback to spring layout
    try:
        pos = nx.nx_agraph.graphviz_layout(G, prog='dot')
    except Exception:
        pos = nx.spring_layout(G, k=0.5, iterations=50)

    plt.figure(figsize=(12, 18))
    nx.draw(G, pos=pos, with_labels=True, node_size=200, font_size=6, arrows=False)
    plt.title('Module hierarchy (networkx fallback)')
    plt.tight_layout()
    out_png = 'model_graph_networkx.png'
    out_svg = 'model_graph_networkx.svg'
    plt.savefig(out_png, dpi=150)
    plt.savefig(out_svg)
    print('Saved', out_png)
    print('Saved', out_svg)


if __name__ == '__main__':
    main()
