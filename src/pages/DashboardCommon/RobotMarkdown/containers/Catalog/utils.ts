const findLastChild = (parent: any, deep = Infinity): any => {
  if (!parent || !parent.children || !parent.children.length || deep <= 0) return parent;
  return findLastChild(parent.children[parent.children.length - 1], deep - 1);
};

export const genTableContentTreeList = (list: any[]) => {
  if (!Array.isArray(list)) return [];
  const res: any[] = [];
  let prev = 1;
  let prevElement: any = null;
  let prevElementChildren: any[] | null = null;
  for (let i = 0; i < list.length; i += 1) {
    const element = { ...list[i], title: list[i].content };
    element.key = i;

    if (element.level === 1) {
      prevElementChildren = null;
      prev = 1;
    }
    if (element.level > prev) {
      prevElement = findLastChild(res[res.length - 1]);
    } else if (element.level < prev) {
      prevElement = findLastChild(res[res.length - 1], element.level - 2);
    }

    if (prevElement) {
      if (!prevElement.children) {
        prevElement.children = [];
      }
      prevElementChildren = prevElement.children;
      prevElementChildren?.push(element);
      prev = element.level;
      prevElement = null;
      continue;
    }

    if (prevElementChildren) {
      prevElementChildren.push(element);
    } else {
      res.push(element);
    }
  }
  return res;
};

export const scrollIntoActiveCatalog = (pageNumber: number, contentId: any) => {
  const activePage = document.querySelector(`#imgContainer [data-page-number="${pageNumber}"]`);
  const oldActivePolygons = document.querySelectorAll('#imgContainer polygon.active');
  if (oldActivePolygons) {
    oldActivePolygons.forEach((item) => {
      item.classList.remove('active');
    });
  }
  activePage?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const handle = () => {
    const targetPolygon = activePage?.querySelector(`polygon[data-content-id="${contentId}"]`);
    if (targetPolygon) {
      targetPolygon.classList.add('active');
      targetPolygon.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      return true;
    }
    return false;
  };
  requestAnimationFrame(() => {
    if (!handle()) {
      requestAnimationFrame(() => {
        handle();
      });
    }
  });
};
