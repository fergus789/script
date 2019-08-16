const {getEventList, updateGist} = require('../lib/utils.js')

async function main(){
  try {
    const response = await getEventList({
      address: '0x1a129a0067c8bfd387d1055428cda0e77237058b',
      topic0: '0x8a6a7f53b3c8fa1dc4b83e3f1be668c1b251ff8d44cdcb83eb3acec3fec6a788',
      fromBlock:8311842, 
      toBlock:8317890
    })
    updateGist('e8466c0e42cd09bece11c326dcf47c4e', {
      content: JSON.stringify(response.data),
      filename: 'pr.json'
    })
  }catch(e){
    console.log(e)
    console.log('request faild')
  }
}

main()