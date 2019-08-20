const abi = require('web3-eth-abi')
const utils = require('web3-utils')

const {getEventList, getCurrentBlock, updateGist, getGist, updateConfig} = require('../lib/utils')
const {GIST_ID, CONFIG_FILE_NAME, MARKET_GIST_FILE_NAME, CONTRACT_EVENTER_ADDRESS, MARKET_START_BLOCK, MARKET_PER_PAGE_BLOCK, MARKET_PRICE_UPDATE_TOPIC} = require('../config')
const getTradeList = async function(from_block, to_block) {
  const data = await getEventList({
    address: CONTRACT_EVENTER_ADDRESS,
    topic0: MARKET_PRICE_UPDATE_TOPIC,
    fromBlock: from_block, 
    toBlock: to_block
  })
  return data
}


async function main(){
  const current_block = await getCurrentBlock()
  // load gist
  const gist = await getGist(GIST_ID)

  let config = {}
  try{
    config = JSON.parse(gist.files[CONFIG_FILE_NAME])
  }catch(e){
    console.log('loading config failed!')
  }
  
  let from_block = config.market_last_update || MARKET_START_BLOCK
  let to_block = from_block + MARKET_PER_PAGE_BLOCK

  let list = []
  try{
    list = JSON.parse(gist.files[MARKET_GIST_FILE_NAME])
  }catch(e){
    from_block = MARKET_START_BLOCK
  }

  let total_pages = Math.ceil((current_block - from_block) / MARKET_PER_PAGE_BLOCK)

  for(let page = 0; page < total_pages; page++){
    const data =  await getTradeList(from_block, to_block)

    for(let i = 0; i < data.length; i++){
      const params_format = [{
        "indexed": false,
        "name": "_price",
        "type": "uint256"
      }, {
        "indexed": false,
        "name": "_value",
        "type": "int256"
      }, {
        "indexed": false,
        "name": "_orders",
        "type": "uint256"
      }, {
        "indexed": false,
        "name": "_ingots",
        "type": "uint256"
      }, {
        "indexed": false,
        "name": "_reserve",
        "type": "uint256"
      }, {
        "indexed": false,
        "name": "_supply",
        "type": "uint256"
      }, {
        "indexed": false,
        "name": "_weight",
        "type": "uint256"
      }
    ]
      const params = abi.decodeLog(params_format, data[i].data)
      const timestamp = utils.hexToNumber(data[i].timeStamp) * 1000
      const price = utils.hexToNumberString(params._price)
      list.push({
        timestamp: timestamp,
        price: price
      })
    }
    from_block = to_block
    to_block += MARKET_PER_PAGE_BLOCK
  }
  list = list.sort(((a, b) => a.timestamp - b.timestamp))

  config = Object.assign({}, config, {
    market_last_update: current_block,
    updated_at: Date.now()
  })

  await updateGist(GIST_ID, {
    [MARKET_GIST_FILE_NAME]: {
      filename: MARKET_GIST_FILE_NAME,
      content: JSON.stringify(list)
    },
    [CONFIG_FILE_NAME]: {
      filename: CONFIG_FILE_NAME,
      config: JSON.stringify(config)
    }
  })

}

module.exports = main