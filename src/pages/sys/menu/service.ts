import request from '@/utils/request';
import { SysMenu } from './data';
const resourceName: string = '/sys/menu';



export async function getTreeMenu() {
  return request(`${resourceName}/tree`);
}

export async function getTreeMenuById(id: string) {
  return request(`${resourceName}/${id}`);
}

export async function upadateMenuById(params: SysMenu) {
  return request(`${resourceName}/${params.id}`, {
    method: 'put',
    data: params
  });
}

export async function insertMenu(params: SysMenu) {
  return request(`${resourceName}`, {
    method: 'post',
    data: params
  });
}

export async function deleteTreeMenuById(id: string) {
  return request(`${resourceName}/${id}`, { method: 'delete' });
}