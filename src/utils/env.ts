export const getEnv = () => {
  const { host } = window.location;
  if (host.includes('test') || host.includes('localhost') || host.includes('192.168')) {
    return env.TEST;
  }
  if (host.includes('pre')) {
    return env.PRE;
  }
  return env.PRODUCTION;
};

export enum env {
  TEST = 'test',
  PRE = 'pre',
  PRODUCTION = 'production',
}

export const prefixPath = (globalThis?.location?.origin || '') + '/';
