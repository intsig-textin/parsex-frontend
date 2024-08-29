export function scrollTo(dom: HTMLElement, scrollTop: number, callBack?: () => void) {
  if (scrollTop === 0 && callBack) {
    callBack();
    return;
  }
  if (!dom.scrollTo) {
    dom.scrollTop = scrollTop;
    if (callBack) {
      callBack();
    }
    return;
  }
  dom.scrollTo({
    top: scrollTop,
    behavior: 'smooth',
  });
  // const scroll = () => {
  //   if (dom.scrollTop === scrollTop) {
  //     dom.removeEventListener('scroll', scroll, false);
  //     callBack && callBack();
  //   }
  //   console.log('xxxxx scroll');
  // };
  // dom.addEventListener('scroll', scroll, false);
}
