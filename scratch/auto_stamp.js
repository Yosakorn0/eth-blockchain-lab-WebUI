const { ethers } = require('ethers');

async function run() {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8552');
    const unlockedAccount = '0x0c0e003d4d66fa9e9c48cd766bcea38b0b18660f';
    
    // Using the EXACT bytecode from deploy.html
    const bytecode = "0x608060405234801561001057600080fd5b50610363806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063a3d58d7c1161001d578063a3d58d7c146100655761002b5b8063e3e6355814610030575b600080fd5b6100636004803603602081101561004657600080fd5b810190808035906020019092919080359060200190929190505050610091565b005b61006d6101ea565b6040518082815260200191505060405180910390f35b806040518080602001828103825283818151815260200191508051906020019080838360005b838110156100d15780820151818401526020810190506100b6565b50505050905090810190601f1680156100fe5780820380516001836020036101000a031916815260200191505b509250505060405180910390a250565b60606040518060400160405280601781526020017f53696d706c655374616d7065722069732041637469766500000000000000000081525090509056fea26469706673582212204c358f50c008298715838084a3b04c358f50c008298715838084a3b064736f6c63430008120033";

    console.log('--- AUTO STAMP START (V2) ---');
    
    try {
        const deployHash = await provider.send('eth_sendTransaction', [{
            from: unlockedAccount,
            data: bytecode
        }]);
        console.log('Deployment Hash:', deployHash);

        let receipt = null;
        while (!receipt) {
            receipt = await provider.getTransactionReceipt(deployHash);
            if (!receipt) await new Promise(r => setTimeout(r, 1000));
        }
        const contractAddress = receipt.contractAddress;
        console.log('Contract Address:', contractAddress);

        const iface = new ethers.Interface([
            "function stamp(string _data)"
        ]);
        const dataPayload = iface.encodeFunctionData("stamp", ["Property of Yosakorn #126512"]);

        // Execute stamp with a manual gas limit just in case
        const stampHash = await provider.send('eth_sendTransaction', [{
            from: unlockedAccount,
            to: contractAddress,
            data: dataPayload,
            gas: "0xF4240" // 1,000,000 in hex
        }]);
        
        console.log('\nSUCCESS!');
        console.log('====================================');
        console.log('COPY THIS TRANSACTION HASH:');
        console.log(stampHash);
        console.log('====================================');
        console.log('And use this Contract Address:');
        console.log(contractAddress);
        
    } catch (e) {
        console.error('Error:', e.message);
    }
}
run();
