import request from '@/utils/request';

export interface LoginParamsType {
  username: string;
  password: string;
  mobile: string;
  captcha: string;
  verifyCode: string
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request('/user/login', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/login/captcha?mobile=${mobile}`);
}

export async function getRouter() {
  return request(`/sys/menu/router/antd`);
}

export async function logoutAccount() {
  return request.post(`/user/logout`);
}
