declare let window: any;
import { createContext, useContext, useState } from "react";
import Web3 from "web3";
import CallspreadToken from "../artifacts/contracts/Callspread.sol/Callspread.json";

interface DataContextProps {
  account: string;
  loading: boolean;
  loadWallet: () => Promise<void>;
  mintToken: ({
    optionPremium,
    optionMultiplier,
    optionExpiry,
    buyerAddress,
  }: {
    optionPremium: any;
    optionMultiplier: any;
    optionExpiry:any;
    buyerAddress: any;
  }) => Promise<any>;
  balance: number;
  tokenId: string;
  contractName: string;
}

const DataContext = createContext<DataContextProps | null>(null);

export const DataProvider: React.FC = ({ children }) => {
  const data = useProviderData();

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};

export const useData = () => useContext<DataContextProps | null>(DataContext);

export const useProviderData = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string>();
  const [callspreadToken, setCallspreadToken] = useState<any>();
  const [tokenId, setTokenId] = useState<string>();
  const [contractName, setContractName] = useState<string>();
  const [balance, setBalance] = useState<number>();

  const loadWallet = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const web3 = window.web3;
      var allAccounts = await web3.eth.getAccounts();
      setAccount(allAccounts[0]);

      setLoading(false);
      
      var callspreadTokenInstance = new web3.eth.Contract(
        CallspreadToken.abi,
        "0x04fE702884f489082cf78e297231799750B4af4E"
      );
      setCallspreadToken(callspreadTokenInstance);
      var contract = await callspreadTokenInstance.methods.name().call();
      setContractName(contract);
    } else {
      window.alert("Non-Eth browser detected. Please consider using MetaMask.");
    }
  };


  const mintToken = async ({ optionPremium, optionMultiplier, optionExpiry, buyerAddress }) => {
    try {
      //var tokenId = await callspreadToken.methods.mint(buyerAddress,optionExpiry,optionPremium,optionMultiplier).call();
      //setTokenId(tokenId);
      return "Minted successfully";
    } catch (e) {
      return e.message;
    }
  };

  return {
    account,
    loading,
    loadWallet,
    mintToken,
    balance,
    tokenId,
    contractName
  };
};