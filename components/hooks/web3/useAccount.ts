import { CryptoHookFactory } from '@_types/hooks'
import { useEffect } from 'react'
import useSWR from 'swr'

type UseAccountResponse ={
  connect: ()=> void;
  isLoading:boolean;
  isInstalled:boolean
}

type AccountHookFactory = CryptoHookFactory<string,UseAccountResponse>

export type UseAccountHook = ReturnType<AccountHookFactory>

// deps --> provider,eth,contract (data from web3State)
export const hookFactory:AccountHookFactory = ({provider,ethereum,isLoading}) => () => {
   
  // const swrRes =  useSWR("web3/useAccount",()=>{
 
  //   console.log(provider)

  //       return "test user"
  //   })
    

   const {data, mutate,isValidating, ...swr}= useSWR(
      provider ? "web3/useAccount" : null,
     async ()=>{
        const accounts = await provider!.listAccounts()
        const account = accounts[0]

         if(!account){
          throw "cannot retreive account! Please connect to web3 wallet."
         }
        return account
      },{
        revalidateOnFocus: false,
        shouldRetryOnError:false,
      }
    )

    useEffect(()=>{
      ethereum?.on("accountsChanged",handleAccountsChanged )

      return ()=>{
        ethereum?.removeListener("accountsChanged",handleAccountsChanged)
      }
    })
    
    const handleAccountsChanged = (...args:unknown[]) =>{
     const accounts = args[0] as string[0];
     if(accounts.length === 0) {
       console.error("please connect to metamask or web3 wallet")
     }else if(accounts[0] != data){
      mutate(accounts[0])
     }
    }


    const connect = async ()=>{

      try{

        ethereum!.request({method: "eth_requestAccounts"})

      }catch(e){
        console.error(e)
      }

    }

    //making req to get data
    return {
      ...swr,
      data,
      isValidating,
      isLoading: isLoading as boolean,
      isInstalled: ethereum?.isMetaMask || false,
      mutate,
      connect
    };    
}

