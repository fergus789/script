const Promise = require('bluebird')
const axios = require('axios')
const qs = require('querystring')
const Octokit = require('@octokit/rest')
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})
console.log(process.env.GITHUB_TOKEN)

const getEventList = function(params) {
  const query = qs.stringify(Object.assign(params,{
    module: 'logs',
    action: 'getLogs',
    apikey: 'YDTMKH534N4G4KN2QF3WN3Z3A1PDCAPR8S'
  }))
  console.log('http://api.etherscan.io/api?' + query)
  return axios.get('http://api.etherscan.io/api?' + query)
}

const updateGist = function(gist_id , files){
  octokit.gists.update({
    gist_id,
    files : {
      [files.filename]: files
    }
  })
}

module.exports = {
  getEventList,
  updateGist
}