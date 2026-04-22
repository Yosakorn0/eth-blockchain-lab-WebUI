// SimpleStamper ABI for Bonus Phase
const SIMPLE_STAMPER_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "_data", "type": "string"}],
        "name": "stamp",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "verify",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "stamper", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "data", "type": "string"},
            {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "DataStamped",
        "type": "event"
    }
];

// Constants for the Campus Node
const CHAIN_ID = "0x1112346"; // 1112346 in decimal
const NETWORK_ID = 123454321;
const RPC_URL = "http://127.0.0.1:8552";

let provider;
let signer;

// Connect Wallet
async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        document.getElementById('wallet-status').innerText = `Connected: ${accounts[0].substring(0,6)}...${accounts[0].substring(38)}`;
        document.getElementById('status-container').classList.add('connected');
        document.getElementById('status-container').classList.remove('disconnected');
        
        return true;
    } catch (error) {
        console.error("Connection failed", error);
        alert("Failed to connect wallet.");
        return false;
    }
}

// Phase A: The Stamper
async function stampData() {
    const inputString = document.getElementById('stamp-input').value;
    const isBonusMode = document.getElementById('mode-toggle').checked;
    const contractAddress = document.getElementById('contract-address').value.trim();

    if (!inputString) {
        alert("Please enter some data to stamp.");
        return;
    }

    if (isBonusMode && !ethers.isAddress(contractAddress)) {
        alert("Please enter a valid Contract Address for Bonus Mode.");
        return;
    }

    if (!signer) {
        const connected = await connectWallet();
        if (!connected) return;
    }

    try {
        const userAddress = await signer.getAddress();
        const btn = document.getElementById('stamp-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading">Mining...</span>';

        let response;

        if (isBonusMode) {
            // BONUS: Smart Contract Call
            const contract = new ethers.Contract(contractAddress, SIMPLE_STAMPER_ABI, signer);
            response = await contract.stamp(inputString, { gasLimit: 1000000 });
        } else {
            // STANDARD: Self-Transaction with Hex Data
            const hexData = ethers.hexlify(ethers.toUtf8Bytes(inputString));
            const tx = {
                to: "0x1111111111111111111111111111111111111111",
                value: 0,
                data: hexData
            };
            response = await signer.sendTransaction(tx);
        }

        console.log("TX Sent:", response.hash);
        const receipt = await response.wait();
        
        // Success UI
        document.getElementById('qr-result').style.display = 'block';
        document.getElementById('tx-hash-display').innerText = response.hash;
        
        if (typeof QRCode !== 'undefined') {
            QRCode.toCanvas(document.getElementById('qr-canvas'), response.hash, {
                width: 200, margin: 2,
                color: { dark: '#0d0e14', light: '#ffffff' }
            }, (error) => { if (error) console.error(error); });
        }

        alert(`Data successfully stamped via ${isBonusMode ? 'Smart Contract' : 'Self-Transaction'}!`);
    } catch (error) {
        console.error("Stamping failed", error);
        alert("Transaction failed: " + error.message);
    } finally {
        const btn = document.getElementById('stamp-btn');
        btn.disabled = false;
        btn.innerText = 'Stamp to Blockchain';
    }
}

// Phase B: The Verifier
async function verifyHash() {
    const txHash = document.getElementById('verify-input').value.trim();
    if (!txHash || txHash.length !== 66) {
        alert("Please enter a valid Transaction Hash (0x...)");
        return;
    }

    if (!provider) {
        provider = new ethers.JsonRpcProvider(RPC_URL);
    }

    try {
        const btn = document.getElementById('verify-btn');
        btn.disabled = true;
        btn.innerText = 'Fetching...';

        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            alert("Transaction not found. Is it mined yet?");
            return;
        }

        const block = await provider.getBlock(tx.blockNumber);
        
        let decodedString = "No data found";
        let isContract = false;

        // Logic check: Is it a contract call or standard tx?
        // SimpleStamper 'stamp' method ID is 0xe3e63558 (first 4 bytes of keccak256("stamp(string)"))
        if (tx.data.startsWith('0xf63c82fb')) {
            isContract = true;
            // Decode contract parameters
            const iface = new ethers.Interface(SIMPLE_STAMPER_ABI);
            const decoded = iface.decodeFunctionData("stamp", tx.data);
            decodedString = decoded[0];
        } else if (tx.data && tx.data !== '0x') {
            // Standard HEX decoding
            decodedString = ethers.toUtf8String(tx.data);
        }

        document.getElementById('verification-details').style.display = 'block';
        document.getElementById('res-data').innerText = decodedString;
        document.getElementById('res-sender').innerText = tx.from;
        document.getElementById('res-block').innerText = `${tx.blockNumber} (at ${new Date(block.timestamp * 1000).toLocaleString()})`;
        
        document.getElementById('res-type').innerText = isContract ? 'Smart Contract Call' : 'Standard Self-Transaction';
        document.getElementById('res-type').className = isContract ? 'badge bonus-badge' : 'badge';

    } catch (error) {
        console.error("Verification failed", error);
        alert("Error decoding data: " + error.message);
    } finally {
        const btn = document.getElementById('verify-btn');
        btn.disabled = false;
        btn.innerText = 'Verify Data';
    }
}

// UI Listeners
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('connect-btn').addEventListener('click', connectWallet);
    document.getElementById('stamp-btn').addEventListener('click', stampData);
    document.getElementById('verify-btn').addEventListener('click', verifyHash);

    // Toggle Handler
    document.getElementById('mode-toggle').addEventListener('change', (e) => {
        const label = document.getElementById('mode-label');
        const config = document.getElementById('contract-config');
        if (e.target.checked) {
            label.innerText = "Mode: Bonus (Smart Contract)";
            config.style.display = 'block';
        } else {
            label.innerText = "Mode: Standard (Self-Tx)";
            config.style.display = 'none';
        }
    });
    // Block Tracker
    setInterval(async () => {
        if (!provider) {
            provider = new ethers.JsonRpcProvider(RPC_URL);
        }
        try {
            const blockNum = await provider.getBlockNumber();
            const el = document.getElementById('block-height');
            if (el) el.innerText = blockNum;
        } catch (e) {}
    }, 3000);
});
