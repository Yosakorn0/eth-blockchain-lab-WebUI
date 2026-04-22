// Constants for the Campus Node
const CHAIN_ID = "0x1112345"; // 1112345 in decimal
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
        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Setup Ethers provider
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        // Update UI
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
    if (!inputString) {
        alert("Please enter some data to stamp.");
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

        // 1. Convert string to Hex
        const hexData = ethers.hexlify(ethers.toUtf8Bytes(inputString));

        // 2. Prepare Self-Transaction
        const tx = {
            to: userAddress,
            value: 0,
            data: hexData
        };

        // 3. Send Transaction
        const response = await signer.sendTransaction(tx);
        console.log("TX Sent:", response.hash);

        // 4. Wait for it to be mined
        const receipt = await response.wait();
        
        // 5. Success UI
        document.getElementById('qr-result').style.display = 'block';
        document.getElementById('tx-hash-display').innerText = response.hash;
        
        // Generate QR Code
        QRCode.toCanvas(document.getElementById('qr-canvas'), response.hash, {
            width: 200,
            margin: 2,
            color: {
                dark: '#0d0e14',
                light: '#ffffff'
            }
        }, function (error) {
            if (error) console.error(error);
        });

        alert("Data successfully stamped onto the blockchain!");
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

        // 1. Fetch Transaction
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            alert("Transaction not found. Is it mined yet?");
            return;
        }

        // 2. Fetch Block for timestamp
        const block = await provider.getBlock(tx.blockNumber);

        // 3. Decode Data
        let decodedString = "No data found";
        if (tx.data && tx.data !== '0x') {
            decodedString = ethers.toUtf8String(tx.data);
        }

        // 4. Update UI
        document.getElementById('verification-details').style.display = 'block';
        document.getElementById('res-data').innerText = decodedString;
        document.getElementById('res-sender').innerText = tx.from;
        document.getElementById('res-block').innerText = `${tx.blockNumber} (at ${new Date(block.timestamp * 1000).toLocaleString()})`;
        
        // Bonus points check: contract interaction?
        if (tx.to && tx.to !== tx.from) {
            document.getElementById('res-type').innerText = 'Smart Contract Call';
        } else {
            document.getElementById('res-type').innerText = 'Standard Self-Transaction';
        }

    } catch (error) {
        console.error("Verification failed", error);
        alert("Error: " + error.message);
    } finally {
        const btn = document.getElementById('verify-btn');
        btn.disabled = false;
        btn.innerText = 'Verify Data';
    }
}

// Listeners
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('connect-btn').addEventListener('click', connectWallet);
    document.getElementById('stamp-btn').addEventListener('click', stampData);
    document.getElementById('verify-btn').addEventListener('click', verifyHash);
});
