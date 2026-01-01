from torchvision import models
from torchviz import make_dot
import torch

def main():
    m = models.resnet18(pretrained=False)
    m.eval()
    x = torch.zeros(1, 3, 224, 224)
    y = m(x)
    # Create graph without passing params to avoid label syntax issues
    dot = make_dot(y)
    dot.format = 'svg'
    dot.render('model_graph_no_params', cleanup=True)
    print('Saved model_graph_no_params.svg')

if __name__ == '__main__':
    main()
