const { json, response } = require('express');
const Web3 = require('web3');
const fs = require('fs')
const abi = require('./abi.json');
const fetch = require('node-fetch');

var getdata = async () => {
    let returndata = {};
    var TokenValue = new Promise(async (resolve, reject) => {  
        let url = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/allowlist.json";
        let settings = { method: "Get" };
        var data = await fetch(url, settings);
        try{
            var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/b0814c44f1de43a1b2024f2c08f0eddc"));
            data.json().then(async (data) => {
                console.log(data.length);
                for(var i = 0; i<2; i++){
                    console.log(data[i]);
                    var contract = new web3.eth.Contract(abi, data[i]);
                    tokenaddress = data[i];
                    let basepath = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/";
                    let url = basepath+tokenaddress+"/info.json";
                    var responseValue = new Promise(async (resolve, reject) => {   
                        let settings = { method: "Get" };
                        const response = await fetch(url, settings);
                        if(response.ok){
                            await response.json().then(async (json) => {
                                console.log(json.name);
                                var symbol = '';
                                var decimal = '';
                                try{
                                    symbol = await contract.methods.symbol().call();
                                    decimal = await contract.methods.decimals().call();
                                }catch(err){

                                }
                                var value = `${tokenaddress}`;
                                returndata[value]={"name":json.name, "symbol": symbol, "decimals": decimal, "image": basepath+tokenaddress+"/logo.png"};
                                // returndata.push();
                            })
                        }else{
                            var name ='';
                            var symbol='';
                            var decimal='';
                            try{
                                name = await contract.methods.name().call();
                                symbol = await contract.methods.symbol().call();
                                decimal = await contract.methods.decimals().call();
                            }catch(err){

                            }
                            
                            console.log("Name",name);
                            console.log("Symbol",symbol);
                            returndata[tokenaddress]={"name":name, "symbol": symbol, "decimals": decimal, "image": basepath+tokenaddress+"/logo.png"};
                            // returndata.push({ [symbol]: {"name":name, "image": basepath+tokenaddress+"/logo.png"}});
                        }
                        resolve(true);
                    });
                    let returnval = await responseValue;
                }
                resolve(true);
            });
        }catch(err){
            console.log(err);
        }
    });
    var data = await TokenValue;
    var finaldata = JSON.stringify(returndata, null, 4);;
    fs.writeFile('./data.json', finaldata, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}
(async () => {
    var res = await getdata();
})();

