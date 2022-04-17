import axios, { Axios } from 'axios';

let instance: Axios;

export function getInstance() {
  if (!instance) {
    instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL
    });
  }

  return instance;
}

export const isAxiosError = (e: Error) => axios.isAxiosError(e);
