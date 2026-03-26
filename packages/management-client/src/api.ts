import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const getDatasources = async () => {
  const res = await axios.get(`${API_URL}/datasource`);
  return res.data;
};

export const createEntityConfig = async (data: any) => {
  const res = await axios.post(`${API_URL}/config`, data);
  return res.data;
};
