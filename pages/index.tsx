import Head from "next/head";
import { useState } from "react";
import Web3 from "web3";
import Navbar from "../components/Navbar";
import { useData } from "../contexts/DataContext";

export default function Home() {
  const { account, mintToken, balance, tokenId , contractName} = useData();
  const [buyerAddress, setToBuyerAddress] = useState("");
  const [optionPremium, setOptionPremium] = useState("");
  const [optionMultiplier, setOptionMultiplier] = useState("");
  const [optionExpiry, setOptionExpiry] = useState("");
  const [error, setError] = useState("");
  const [button, setButton] = useState("Mint Token");

  return (
    <div className="flex flex-col min-h-screen justify-start bg-gradient-to-b from-gray-500  to-gray-200">
      <Head>
        <title>Callspread - CYTech</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />

      <main className="mt-36 flex justify-center items-start">
        <div className="w-full md:w-2/6 bg-gray-500 rounded-3xl p-4 mx-3">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-full flex flex-row justify-between">
              <span className="text-white text-lg text-start">NFT - Derivatives</span>
            </div>
            <div className="bg-gray-700 h-20 w-full my-1 border border-gray-600 rounded-3xl flex flex-row justify-between items-center px-3">
              <select
                className="w-full font-inconsolata text-xl text-white bg-transparent outline-none"
                placeholder="Smart contracts to use"
                value={contractName}
              >
                <option value={contractName}>{contractName}</option>
              </select>
            </div>
            <div className="bg-gray-700 h-20 w-full my-1 border border-gray-600 rounded-3xl flex flex-row justify-between items-center px-3">
              <select
                className="w-full font-inconsolata text-xl text-white bg-transparent outline-none"
                placeholder="Underlying"
                value="EUR/USD"
              >
                <option value="EUR/USD">EUR/USD</option>
              </select>
            </div>
            <div className="bg-gray-700 h-20 w-full my-1 border border-gray-600 rounded-3xl flex flex-row justify-between items-center px-3">
              <input
                className="w-full font-inconsolata text-xl text-white bg-transparent outline-none"
                placeholder="Buyer Wallet's Address"
                value={buyerAddress}
                onChange={(e) => {
                  setToBuyerAddress(e.target.value);
                }}
              />
            </div>
            <div className="bg-gray-700 h-20 w-full my-1 border border-gray-600 rounded-3xl flex flex-row justify-between items-center px-3">
            <input
                className="w-full font-inconsolata text-xl text-white bg-transparent outline-none"
                placeholder="Option premium"
                value={optionPremium}
                onChange={(e) => {
                  setOptionPremium(e.target.value);
                }}
              />
              <input
                className="w-full font-inconsolata text-xl text-white bg-transparent outline-none"
                placeholder="Option multiplier"
                value={optionMultiplier}
                onChange={(e) => {
                  setOptionMultiplier(e.target.value);
                }}
              />
            </div>
            <div className="bg-gray-700 h-20 w-full my-1 border border-gray-600 rounded-3xl flex flex-row justify-between items-center px-3">
              <input
                className="w-full font-inconsolata text-xl text-white bg-transparent outline-none"
                placeholder="Option expiry"
                type="datetime-local"
                value={optionExpiry}
                onChange={(e) => {
                  setOptionExpiry(e.target.value);
                }}
              />
            </div>
            <div className="h-4" />
            <div
              className="h-16 w-full rounded-3xl flex justify-center items-center cursor-pointer"
              style={{ backgroundColor: "#FF8C00" }}
              onClick={async () => {
                setError("");
                if (!account) {
                  setError("Please connect your wallet");
                } else if (optionPremium === "") {
                  setError("Please set an Option premium");
                } else if (buyerAddress === "") {
                  setError("Please set a Buyer address");
                } else if (optionMultiplier === "") {
                  setError("Please set an Option multiplier");
                } else if (optionExpiry === "") {
                  setError("Please set an Option expiry");
                } else {
                  setButton("Minting...");
                  // TODO Faux timeout jusqu'à optionExpiry
                  let n: ReturnType<typeof setTimeout>;
                  await new Promise(f => setTimeout(f, 10000)); // 10 secondes

                  var msg = await mintToken({ optionPremium, optionMultiplier, optionExpiry, buyerAddress });
                  if ((await msg) === "Minted successfully") {
                    setOptionPremium("");
                    setToBuyerAddress("");
                    setOptionMultiplier("");
                    setOptionExpiry("");
                    setButton("Minted successfully with id : "+tokenId);
                    setError("");
                  } else {
                    setError(msg);
                  }
                }
              }}
            >
              <span className="font-semibold text-xl text-orange-300">
                {button}
              </span>
            </div>
            {error && <span className="text-red-600 font-bold">*{error}</span>}
          </div>
        </div>
      </main>
    </div>
  );
}
