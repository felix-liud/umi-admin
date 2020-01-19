import request from '@/utils/request';
const resourceName = '/sys/menu';

export async function getRouter() {
  return request(`${resourceName}/router/antd`);
}