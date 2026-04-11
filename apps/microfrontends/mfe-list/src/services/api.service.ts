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

  getData: async (entity: string) => {
    const res = await axios.get(`${API_BASE}/data/${entity}`);
    return res.data;
  },

  deleteData: async (entity: string, id: string) => {
    const res = await axios.delete(`${API_BASE}/data/${entity}/${id}`);
    return res.data;
  }
};
