import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
    web3: null,
    account: null,
    meta: null,

    start: async function () {
        const { web3 } = this;

        try {
            // get contract instance
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = starNotaryArtifact.networks[networkId];
            this.meta = new web3.eth.Contract(
                starNotaryArtifact.abi,
                deployedNetwork.address
            );

            // get accounts
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
        } catch (error) {
            console.error("Could not connect to contract or chain.");
        }
    },

    setStatus: function (message) {
        const status = document.getElementById("status");
        status.innerHTML = message;
    },

    createStar: async function () {
        const { createStar } = this.meta.methods;
        const name = document.getElementById("starName").value;
        const id = document.getElementById("starId").value;
        await createStar(name, id).send({ from: this.account });
        App.setStatus("New Star Owner is " + this.account + ".");
    },

    // Implement Task 4 Modify the front end of the DAPP
    lookUp: async function () {
        const { lookUptokenIdToStarInfo, ownerOf } = this.meta.methods;
        const wantedId = document.getElementById("lookid").value;
        const name = await lookUptokenIdToStarInfo(wantedId).call();
        const owner = await ownerOf(wantedId).call();
        this.setStatus(
            `Star with ID "${wantedId}" is named "${name}" and is owned by ${owner}`
        );
    },

    transferStar: async function () {
        const { transferStar } = this.meta.methods;
        const starId = document.getElementById("xferStarId").value;
        const toAddr = document.getElementById("xferToAddr").value;
        await transferStar(toAddr, starId).send({ from: this.account });
        this.setStatus(`Star with ID "${starId}" transfered to "${toAddr}"`);
    },

    exchangeStars: async function () {
        const { exchangeStars } = this.meta.methods;
        const starId1 = document.getElementById("exchangeStarId1").value;
        const starId2 = document.getElementById("exchangeStarId2").value;
        await exchangeStars(starId1, starId2).send({ from: this.account });
        this.setStatus(
            `Stars with IDs "${starId1}" and "${starId2}" have swapped owners.`
        );
    },
};

window.App = App;

window.addEventListener("load", async function () {
    if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // get permission to access accounts
    } else {
        console.warn(
            "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live"
        );
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        App.web3 = new Web3(
            new Web3.providers.HttpProvider("http://127.0.0.1:9545")
        );
    }

    App.start();
});
