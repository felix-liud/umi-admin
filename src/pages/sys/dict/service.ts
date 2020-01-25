import request from '@/utils/request';
import { QueryFieldsType } from './index';
const resourceName: string = '/sys/dict';



export async function getDicts(params: QueryFieldsType) {
  return request(`${resourceName}`, {
    params
  });
}
