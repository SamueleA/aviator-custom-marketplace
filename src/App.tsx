import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {sequence} from '0xsequence'
import { Button, Box, Card } from '@0xsequence/design-system';
import pathHud from './path_hud.png'
import plane from './plane.png'
import {ethers} from 'ethers'

//@ts-ignore
import { TickerBoard } from 'ticker-board'
import SequenceMarketABI from './ISequenceMarket.json'
// const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Characters to iterate through

// const SplitFlapDisplay = ({ names }: any) => {
//   const [currentName, setCurrentName] = useState('');
//   const [displayedName, setDisplayedName] = useState('');
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('');

//   useEffect(() => {
//     const flipThroughCharacters = (nameIndex: any, charIndex: any) => {
//       if (nameIndex >= names.length) return;

//       const targetName = names[nameIndex].toUpperCase();
//       const nextCharIndex = (charIndex + 1) % (targetName.length + 1);
//       const nextNameIndex = nextCharIndex === 0 ? nameIndex + 1 : nameIndex;

//       let nextDisplayedName = displayedName;
//       if (charIndex < targetName.length) {
//         const targetChar = targetName[charIndex];
//         const charPos = characters.indexOf(targetChar);
//         let currentCharIndex = characters.indexOf(nextDisplayedName[charIndex] || ' ') + 1;
//         if (currentCharIndex >= characters.length) currentCharIndex = 0; // Loop back to the start
//         nextDisplayedName = nextDisplayedName.substring(0, charIndex) +
//                              characters[currentCharIndex] +
//                              nextDisplayedName.substring(charIndex + 1);

//         if (characters[currentCharIndex] === targetChar) {
//           setTimeout(() => flipThroughCharacters(nextNameIndex, nextCharIndex), 1000); // Wait before flipping the next character
//         } else {
//           setTimeout(() => flipThroughCharacters(nameIndex, charIndex), 50); // Speed of character flipping
//         }
//       } else {
//         setTimeout(() => flipThroughCharacters(nextNameIndex, nextCharIndex), 1000); // Wait before starting the next name
//       }

//       setDisplayedName(nextDisplayedName.padEnd(targetName.length, ' ')); // Pad the displayed name to match the target length
//     };

//     flipThroughCharacters(0, 0);
//   }, [names]);

//   return (
//     <div className="split-flap-display">
//       {displayedName}
//     </div>
//   );
// };

const ColorPanels = () => {
  const colors = [
    'rgba(255, 0, 0, 0.65)', // red
    'rgba(255, 165, 0, 0.65)', // orange
    'rgba(173, 216, 230, 0.65)', // orange
    'rgba(0, 128, 0, 0.65)', // green
    'rgba(255, 255, 0, 0.65)', // yellow
    'rgba(0, 0, 255, 0.65)', // blue
    'rgba(75, 0, 130, 0.65)', // indigo
  ].reverse()

  // const colors = ['red', 'orange', 'lightblue', 'green','yellow',,'blue', 'indigo'];

  const [selectedId, setSelectedId] = useState(null); // Track the selected panel

  const handlePanelClick = (id: any) => {
    setSelectedId(id); // Update the selected panel ID
    console.log(`Selected panel ID: ${id}`); // Log the ID or perform other actions as needed
  };
  useEffect(() => {

  }, [selectedId])

  return (
    <div className="panel-container">
      <div
        className={`color-panel top-panel ${selectedId === 0 ? 'selected' : ''}`}
        style={{ backgroundColor: colors[0] }}
        onClick={() => handlePanelClick(0)}
      ></div>
      <div className="grid-container">
        {colors.slice(1).map((color, index) => (
          <div
            key={index}
            className={`color-panel ${selectedId === index + 1 ? 'selected' : ''} ${selectedId !== null && selectedId !== index + 1 ? 'greyed-out' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handlePanelClick(index + 1)}
          ></div>
        ))}
      </div>
    </div>
  );
};
  
function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [topOrders, setTopOrders] = useState([])
  sequence.initWallet("AQAAAAAAAAfalbPQnQhGI9F68UTWT9RyHlM",{defaultNetwork: 'polygon'})

  useEffect(() => {
    new TickerBoard('.create-ticker')
    setTimeout(async ()=>{
      const res = await fetch('https://dev-marketplace-api.sequence.app/polygon/rpc/Marketplace/GetTopOrders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "collectionAddress": "0x631998e91476da5b870d741192fc5cbc55f5a52e",
            "currencyAddresses": ["0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"],
            "orderbookContractAddress": "0xB537a160472183f2150d42EB1c3DD6684A55f74c",
            "tokenIDs": [
                "65545"
            ],
            "isListing": true,
            "priceSort": "DESC"
        })
    });
    const result = await res.json()

    const results: any = await Promise.all(result.orders.map(async (order: any) => {
      console.log('in this loop')
      const res = await fetch(`https://metadata.sequence.app/tokens/${'polygon'}/${order.tokenContract}/${order.tokenId}`)
      const json = await res.json()
      console.log(json)
      order.image = json[0].image
      return order
    }))
    console.log(results)
    setTopOrders(results)
    }, 0)
  }, [loggedIn])

  const connect = async () => {
    const wallet = sequence.getWallet()
    const details = await wallet.connect({app: 'sequence-market-feed'})

    if(details.connected){
      setLoggedIn(true)
       new TickerBoard('.create-ticker')
    }
  }

  const createOrder = async () => {
    const wallet = sequence.getWallet()
    const signer = wallet.getSigner(137)
    const erc1155Interface = new ethers.utils.Interface(["function setApprovalForAll(address operator, bool approved) external"])
    const sequenceMarketInterface = new ethers.utils.Interface(SequenceMarketABI.abi)

    const request = {
        creator: await wallet.getAddress(),
        isListing: true,
        isERC1155: true,
        tokenContract: '0x1693ffc74edbb50d6138517fe5cd64fd1c917709',
        tokenId: 0,
        quantity: 1,
        expiry: Date.now()+1000*60*60,
        currency: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        pricePerToken: 400
    }

    const data = sequenceMarketInterface.encodeFunctionData(
      'createRequest', [request]
    )

    const dataApprove = erc1155Interface.encodeFunctionData(
      'setApprovalForAll', ["0xB537a160472183f2150d42EB1c3DD6684A55f74c",true]
    )

    const tx = {
      to: "0xB537a160472183f2150d42EB1c3DD6684A55f74c",
      data: data
    }

    const txApprove = {
      to: "0x1693ffc74edbb50d6138517fe5cd64fd1c917709",
      data: dataApprove
    }

    const res = await signer.sendTransaction([txApprove,tx])
    console.log(res)
  }

  const aircraftNames = ['AVIATOR', "HANGAR!"];

  return (
    <div className="App">
      {
        loggedIn ? 
          <>
          <br/>
          <br/>
          <span style={{cursor: 'pointer', fontFamily: 'circular', color: 'black', paddingBottom: '5px', borderBottom: '1px solid black', display: 'inline-block'}}>mint</span>
          &nbsp;&nbsp;&nbsp;&nbsp;<span style={{fontFamily: 'circular', cursor: 'pointer', color: 'black', paddingBottom: '5px', borderBottom: '0px solid black', display: 'inline-block'}}>market</span>
          &nbsp;&nbsp;&nbsp;&nbsp;<span style={{fontFamily: 'circular', cursor: 'pointer', color: 'black', paddingBottom: '5px', borderBottom: '0px solid black', display: 'inline-block'}}>sell</span>
            <div className='parent'>

            <ul className="create-ticker">
              {['MINT'].map((heading) => {
                return <li style={{paddingTop: '20px !important'}}>{heading}</li>
              })}
          </ul>
          </div>
          <p style={{color: 'black', fontFamily: 'circular'}}>✈️ choose your plane color</p>
          <Box justifyContent={'center'}>
            <ColorPanels />
          </Box> 
          <br/>
          <Box justifyContent={'center'}>
            <Button padding={"4"} label="create order" onClick={() => createOrder()}></Button>
          </Box>   
            <br/>
            <Box justifyContent={'center'}>
              <div style={{width: '400px', height: '400px'}}>
                {
                  topOrders.map((order: any) => {
                    if(order.tokenContract) return <Card>
                      contract: {order.tokenContract!.slice(0,8)}...
                      <br/>
                      <br/>
                      expiry: {new Date(order.expiry * 1000).toUTCString()}
                      <br/>
                      <br/>
                      <img src={order.image} width={'120px'}/>
                    </Card>
                  })
                }
              </div>
            </Box>
          </>
        :
        <>
          <br/>
          <br/>
          <div className="parent">
          <ul className="create-ticker">
              {aircraftNames.map((aircraft) => {
                return <li style={{paddingTop: '20px !important'}}>{aircraft}</li>
              })}
          </ul>
          </div>
          <br/>
          <Box>
            <Button variant="primary" padding={"4"} label="connect" onClick={() => connect()}></Button>
          </Box>
          
          <br/>
          <br/>
        </>
      }
    </div>
  );
}

export default App;
