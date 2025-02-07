export function getChildWidth(wrapper: Element | string) {
  let totalWith: number = 0;
  if (!(wrapper instanceof Element)) {
    const container = document.querySelector(wrapper);
    // eslint-disable-next-line no-param-reassign
    if (container) wrapper = container;
  }
  if (!wrapper) return 0;
  const children = (wrapper as Element).children;
  if (!children) return 0;
  Array.from(children).forEach((child) => {
    const marginLeft = parseInt(getComputedStyle(child).marginLeft);
    const marginRight = parseInt(getComputedStyle(child).marginRight);
    const clientWidth = child.getBoundingClientRect().width;
    const calcWidth = marginLeft + marginRight + clientWidth;
    totalWith += calcWidth;
  });

  return totalWith;
}
export const getActualOffsetTop = (
  target: HTMLElement,
  parentDom: HTMLElement = document.documentElement,
) => {
  const top = target.getBoundingClientRect().top;
  const parentOffsetTop = parentDom.getBoundingClientRect().top;
  return top + parentDom.scrollTop - parentOffsetTop;
};
export const getChildOffsetTop = (dom: HTMLElement, scrollDom: HTMLElement) => {
  const children = scrollDom.children;
  return Array.from(children).map((child) => getActualOffsetTop(child as HTMLElement, dom));
};

// 将容器dom滚动到指定的子节点
export const scrollToChild = (dom: HTMLElement | undefined, index: number) => {
  if (!dom) {
    return;
  }
  const children = dom.children;
  if (index < 0 || index >= children.length) {
    return;
  }
  const targetElement = children[index];

  targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });
};

// 获取当前节点下哪个子节点处于可视区域
export function getVisibleChildIndex(container: HTMLElement | undefined) {
  if (!container) {
    return -1;
  }
  // 获取容器滚动的距离
  const containerScrollTop = container.scrollTop;

  // 获取容器中的所有子元素
  const children = container.children;

  // 获取容器的可见高度
  const containerHeight = container.clientHeight;

  // 遍历所有子元素，判断是否有一半已经进入可视区域
  for (let i = 0; i < children.length; i += 1) {
    const child: any = children[i];
    const childTop = child.offsetTop; // 子节点顶部相对于容器的偏移量
    const childHeight = child.offsetHeight; // 子节点的高度

    // 子节点的底部位置
    const childBottom = childTop + childHeight;

    // 计算子节点进入可视区域的部分
    const visibleTop = Math.max(childTop, containerScrollTop);
    const visibleBottom = Math.min(childBottom, containerScrollTop + containerHeight);
    const visibleHeight = visibleBottom - visibleTop;

    // 如果可见部分大于等于子节点高度的一半，认为这个子节点在可视区域内
    if (visibleHeight >= childHeight / 2) {
      return i;
    }
  }

  // 如果没有找到合适的子节点，返回 -1
  return -1;
}
