import request from '@/utils/request';
const resourceName = '/sys/menu';

export async function getTreeMenu() {
  return request(`${resourceName}/tree`);
}