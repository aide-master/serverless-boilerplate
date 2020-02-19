import * as Joi from '@hapi/joi'
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import axios, { AxiosRequestConfig } from 'axios'
import SocksProxyAgent from 'socks-proxy-agent'
import { AnyObject } from '../types'
import { parse } from 'node-html-parser'
import * as qs from 'qs'
import session from './session'

export const validate = (data: any, schema: Joi.AnySchema): any => {
  const result = schema.validate(data, {
    allowUnknown: true
  })
  if (result.error) {
    throw result.error
  }
  return result.value
}

type ControllerWrapper = (func: APIGatewayProxyHandler) => APIGatewayProxyHandler

export const run: ControllerWrapper = (func) => {
  return async (event, _context, callback) => {
    return session.runPromise(async () => {
      const requestId = event.requestContext.requestId
      session.set('requestId', requestId)
      console.time(requestId)
      let result: APIGatewayProxyResult
      try {
        result = (await func(event, _context, callback)) as APIGatewayProxyResult
      } catch (error) {
        console.error('error: ', error)
        result = {
          statusCode: 200,
          body: JSON.stringify({
            code: 1,
            err: error
          }, null, 2)
        }
      }
      result.headers = Object.assign({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }, result.headers)
      console.timeEnd(requestId)
      console.log('\n')
      return result
    })
  }
}

const axiosOptions: AxiosRequestConfig = {}
if (process.env.IS_OFFLINE) {
  const httpsAgent = new SocksProxyAgent({
    host: '127.0.0.1',
    port: 1086,
    protocol: 'socks5:',
    rejectUnauthorized: false
  })
  axiosOptions.httpAgent = httpsAgent
  axiosOptions.httpsAgent = httpsAgent
  axiosOptions.proxy = false
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = null
}

export const rest = axios.create(axiosOptions)
rest.interceptors.request.use(req => {
  const requestId = session.get('requestId')
  console.log(`${requestId}: external request ${req.method}: ${req.url}`);
  (req as any).startTime = new Date().getTime()
  return req
}, err => {
  const requestId = session.get('requestId')
  console.error(`${requestId}: external req error:`)
  console.error(err)
  throw err
})

rest.interceptors.response.use(res => {
  const requestId = session.get('requestId')
  console.log(`${requestId}: external response ${res.config.method}: ${res.config.url}, status: ${res.status}, time: ${new Date().getTime() - (res.config as any).startTime}ms`)
  return res
}, err => {
  const requestId = session.get('requestId')
  console.error(`${requestId}: external req error:`)
  console.error(err)
})
