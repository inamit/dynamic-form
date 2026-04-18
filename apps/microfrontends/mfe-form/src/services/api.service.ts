/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const ApiService = {
  getConfig: async (entity: string) => {
    const res = await axios.get(`${API_BASE}/config/${entity}`);
    return res.data;
  },

  getAbilities: async (entity: string) => {
    const res = await axios.get(`${API_BASE}/data/${entity}/abilities`);
    return res.data;
  },

  getSchema: async (entity: string) => {
    const res = await axios.get(`${API_BASE}/schema/${entity}`);
    return res.data;
  },

  getEnum: async (enumName: string) => {
    const res = await axios.get(`${API_BASE}/enums/${enumName}`);
    return res.data;
  },

  getEnums: async () => {
    const res = await axios.get(`${API_BASE}/enums`);
    return res.data;
  },

  getDataById: async (entity: string, id: string) => {
    const res = await axios.get(`${API_BASE}/data/${entity}/${id}`);
    return res.data;
  },

  createData: async (entity: string, data: any) => {
    const res = await axios.post(`${API_BASE}/data/${entity}`, data);
    return res.data;
  },

  updateData: async (entity: string, id: string, data: any) => {
    const res = await axios.put(`${API_BASE}/data/${entity}/${id}`, data);
    return res.data;
  }
};
