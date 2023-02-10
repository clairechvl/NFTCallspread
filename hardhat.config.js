require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploy the smart contracts", async(taskArgs, hre) => {

  const Callspread = await hre.ethers.getContractFactory("Callspread");
  const callspread = await Callspread.deploy();

  await callspread.deployed();

  await hre.run("verify:verify", {
    address: callspread.address,
    constructorArguments: [
      "Callspread",
      "CSCEUR"
    ]
  })

})

module.exports = {
  solidity: "0.8.4",
  networks: {
    mumbai: {
      url: "https://matic-testnet-archive-rpc.bwarelabs.com/",
      accounts: [
        process.env.PRIVATE_KEY,
      ]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGON_API_KEY,
  }
};