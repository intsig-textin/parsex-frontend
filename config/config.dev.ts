import { defineConfig } from 'umi';
import routes from './routes/index';

let devRoutes = [...routes];

/**
 * @name 用于本地开发环境
 */
export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  fastRefresh: {},
  routes: devRoutes,
  analyze: {
    analyzerMode: 'server',
    analyzerHost: '127.0.0.1',
    analyzerPort: 8888,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  },
});
