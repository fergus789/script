const Promise = require('bluebird')
const axios = require('axios')
const axiosRetry = require('axios-retry')
const qs = require('querystring')
const Octokit = require('@octokit/rest')
const {hexToNumberString} = require('web3-utils')

const {GIST_ID, CONFIG_FILE_NAME} = require('../config')

axiosRetry(axios, { retries: 3 });

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const getEventList = async function(params) {
  const query = qs.stringify(Object.assign(params,{
    module: 'logs',
    action: 'getLogs',
    apikey: process.env.ETHERSCAN_API_KEY
  }))
  console.log('http://api.1smart.fund/api?' + query)
  const {data:{result}} = await axios.get('http://api.1smart.fund/api?' + query)
  return result
}

const getCurrentBlock = async function() {
  const query = qs.stringify({
    module: 'proxy',
    action: 'eth_blockNumber',
    apikey: process.env.ETHERSCAN_API_KEY
  })
  const {data:{result}} = await axios.get('http://api.1smart.fund/api?' + query)
  return hexToNumberString(result)
}

const updateGist = function(gist_id , files){
  return octokit.gists.update({
    gist_id,
    files : files
  })
}

const getGist = function(gist_id){
  const gist = octokit.gists.get({
    gist_id
  })
  return gist
}

module.exports = {
  getEventList,
  getCurrentBlock,
  updateGist,
  getGist
}