import * as dynamoose from 'dynamoose'

if (process.env.IS_OFFLINE) {
  console.log('offline mode')
  // 如果是离线模式，就设置下dynamodb使用本地连接
  dynamoose.local('http://localhost:4567')
}
