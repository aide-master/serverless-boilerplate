import axios from 'axios'

const DEFAULT_API = 'https://api.aidemaster.com/demo'
export const rest = axios.create({
  baseURL: process.env.API ?? DEFAULT_API
})

rest.interceptors.response.use(res => {
  const { code, data, err } = res.data
  if (code) { // code不为0即报错
    throw new Error(`Error(${code}):\n${err}`)
  }
  res.data = data
  return res
}, err => {
  throw err
})
