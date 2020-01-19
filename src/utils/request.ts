/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { notification } from 'antd';
import { extend, RequestOptionsInit } from 'umi-request';
import { API_PREFIX } from '@/static/settings';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
*@Description 处理get请求的参数对象为 xx.xx.xx
*@method handleParams
*@param{json} 参数名: json 参数说明: 需要处理的json对象
*@return {object}
*/
const handleParams = function(json: object) {
  const keyValue = {};
  const func = (prefix: string, items: object) => {
    for (const key in items) {
      const item = items[key];
      if (item === '') {
        continue;
      }
      let nextPrefix;
      if (prefix === '') {
        nextPrefix = key;
      } else {
        nextPrefix = prefix + '.' + key;
      }
      if (typeof item === 'object') {
        func(nextPrefix, item);
      } else {
        keyValue[nextPrefix] = item;
      }
    }
  };
  func('', json);
  return keyValue;
};

// 状态码
const codeMaps = {
  2000: '请求成功',
  5000: '服务器错误',
  4000: '用户未登录',
  4001: '表单校验失败',
  4002: '用户名或密码错误',
  4003: '操作失败',
  4004: '验证码错误',
  4005: '该用户已被禁用，无法登录',
  4010: '登录失效，请重新登录',
  4030: '用户无权限'
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;
  console.dir(error, '异常处理中间');
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  prefix: API_PREFIX,
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  timeout: 1e4,
});

// 请求前的拦截.
request.interceptors.request.use((url: string, options: RequestOptionsInit) => {
  if (options.method === 'get') {
    options.data = handleParams(options.params as object);
  }
  return (
    {
      url,
      options: { ...options, interceptors: true },
    }
  );
});

// 响应拦截
request.interceptors.response.use(async (response: Response) => {
  const res = await response.clone().json();
  const { code } = res;
  if (response.status === 200 && code !== 2000) {
    notification.error({ description: codeMaps[res.code], message: '请求失败'});
  }
  return response;
});
export default request;
