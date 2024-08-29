/**
 * Browser list
 * google chrome: 65
 * QQBrowser: 10
 * Edge: 44
 * 360Browser: se
 * IE: 11
 */

// 查看各个浏览器agent【https://tool.ip138.com/useragent/】
const userAgent = navigator.userAgent || window.navigator.userAgent;

function getVersion(browserAgent: string, keywords: string) {
  const reg = new RegExp(`(${keywords}\/)[0-9]+`);
  const version = browserAgent.match(reg);
  if (version?.length) {
    return version[0]?.replace(new RegExp(`${keywords}\/`), '');
  }
  return 100;
}

const BrowserCompatible = (agent?: string) => {
  const browserAgent = agent || userAgent;
  if (!browserAgent) return true;

  // 判断是否IE<11浏览器
  const isIE = browserAgent.indexOf('compatible') > -1 && browserAgent.indexOf('MSIE') > -1;
  // 判断是否IE的Edge浏览器 [百科详情 - https://baike.baidu.com/item/Microsoft%20Edge#8]
  // 判断是否是旧版内核Edge
  const isEdge = browserAgent.indexOf('Edge') > -1 || browserAgent.indexOf('Edg') > -1;
  // 判断是否是QQ浏览器10版本以上
  const isQQBrowser = browserAgent.indexOf('QQBrowser') > -1;
  // 判断是否是360极速版本 / 360浏览器不区分版本
  const is360Browser = browserAgent.indexOf('360SE') > -1;
  // google
  const isChromeBrowser =
    browserAgent.indexOf('Chrome') > -1 && browserAgent.indexOf('AppleWebKit') > -1;

  if (isIE) {
    return false;
  }
  if (isEdge) {
    if (browserAgent.indexOf('Edge') > -1) {
      const version = getVersion(browserAgent, 'Edge');
      return +version >= 44;
    }
    if (browserAgent.indexOf('Edg') > -1) {
      const version = getVersion(browserAgent, 'Edg');
      return +version >= 44;
    }
  }
  if (isChromeBrowser) {
    const version = getVersion(browserAgent, 'Chrome');
    return +version >= 65;
  }
  if (isQQBrowser) {
    const version = getVersion(browserAgent, 'QQBrowser');
    return +version >= 10;
  }
  if (is360Browser) {
    if (browserAgent.indexOf('360SEE') > -1) {
      return true;
    }
    return false;
  }
  return true;
};

export const checkBrowser = () => {
  const status = BrowserCompatible();
  const { location } = window;
  if (!status && location.pathname !== '/') {
    // ie 中没有window.location.origin
    window.location.replace(`${window.location.protocol}//${window.location.host}/`);
    return true;
  }
};

/**
 * 判断是否Mac OS
 */
export const isMacOS = () => {
  if (!userAgent) return false;
  return /macintosh|mac os x/i.test(navigator.userAgent);
};

/**
 * 判断是否IE<11浏览器
 */
export const isLessIE11 = userAgent
  ? userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)
  : true;
export const isIEBrowser = userAgent
  ? userAgent.indexOf('rv:') > -1 || userAgent.indexOf('MSIE') > -1
  : false;

// 判断是否为移动端设备的函数
export const isMobileDevice = (userAgent: string) => {
  return /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile/i.test(
    userAgent,
  );
};

export default BrowserCompatible;
