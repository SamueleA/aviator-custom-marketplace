import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {sequence} from '0xsequence'
import { Button, Box, Card, Text, Modal,useTheme, TextInput } from '@0xsequence/design-system';
import pathHud from './path_hud.png'
import plane from './plane.png'
import {ethers} from 'ethers'
//@ts-ignore
import TickerBoard from './TickerBoard'
//@ts-ignore
import { Board } from 'ticker-board'
import SequenceMarketABI from './ISequenceMarket.json'
import { SequenceIndexer } from '@0xsequence/indexer'
import { AnimatePresence } from 'framer-motion'
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import DateTimePicker from 'react-datetime-picker';
import { request } from 'http';

function BasicDateTimePicker(props: any) {
  const [value, onChange] = useState<any>(new Date());
  return (
    <DateTimePicker isCalendarOpen={false} 
    onChange={(value) => {
      console.log(value)
      const epochTime = Date.parse(value!.toString()); // Convert milliseconds to seconds
    // console.log(epochTime);console.log(value);onChange(value)
    // let myDate = value
      console.log(epochTime)
// Adding 2 hours
// myDate.setHours(myDate.getHours() + 2);

// Adding 30 minutes
// myDate.setMinutes(myDate.getMinutes() + 30);
props.setExpiry(epochTime)
onChange(value)
  }} value={value} />
  );
}
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

const ColorPanels = (props: any) => {
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


  const handlePanelClick = (id: any) => {
    props.setSelectedId(id); // Update the selected panel ID
    console.log(`Selected panel ID: ${id}`); // Log the ID or perform other actions as needed
  };

  useEffect(() => {
    console.log(props.colored)
  }, [props.selectedId])
  return (
    <div className="panel-container">
      <div
        className={`color-panel top-panel ${props.selectedId == 0 ? 'selected' : ''}`}
        style={{ backgroundColor: props.colored ? (props.colored[0] > 0) ? colors[0] : 'grey' : colors[0] }}
        onClick={() => {
          if(props.colored&&props.colored[0] > 0) handlePanelClick(0)
              else if(!props.colored)  handlePanelClick(0)
        }}
      >{props.market == true && props.colored &&props.colored[0] > 0 && props.colored[0]}</div>
      <div className="grid-container">
        {colors.slice(1).map((color, index) => (
          <div
            key={index}
            className={`color-panel ${props.selectedId === index + 1 ? 'selected' : ''} ${props.selectedId !== null && props.selectedId !== index + 1 ? 'greyed-out' : ''}`}
            style={{ backgroundColor: props.colored ?  props.colored.slice(1,props.colored.length-1)[index] > 0 ? color : 'grey' : color}}
            onClick={() => {
              console.log(props.requests)
              props.setRequestId(props.requests.slice(1,props.requests.length-1)[index])
              console.log(props.requests.slice(1,props.requests.length-1)[index])
              if(props.colored&&props.colored.slice(1,props.colored.length-1)[index] > 0) handlePanelClick(index + 1)
              else if(!props.colored)  handlePanelClick(index + 1)
            }}
          >{props.market == true && props.colored &&props.colored.slice(1,props.colored.length-1)[index] > 0 && props.colored.slice(1,props.colored.length-1)[index]}</div>
        ))}
      </div>
    </div>
  );
};
  
let flipBoard: any = null
function App() {
  const {setTheme} = useTheme()
  setTheme('light')
  const [loggedIn, setLoggedIn] = useState(false)
  const [topOrders, setTopOrders] = useState([0,0,0,0,0,0,0])
  const [selectedId, setSelectedId] = useState(null); // Track the selected panel
  const [view, setView] = useState(0)
  const [isOpen, toggleModal] = useState(false)
  const [requestId, setRequestId] = useState(null)
  const [requests, setRequests] = useState([])

  sequence.initWallet("AQAAAAAAAAfalbPQnQhGI9F68UTWT9RyHlM",{defaultNetwork: 'polygon'})

  useEffect(() => {
    // new TickerBoard('.create-ticker')
    setTimeout(async ()=>{
      const res = await fetch('https://dev-marketplace-api.sequence.app/polygon/rpc/Marketplace/GetTopOrders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "collectionAddress": "0x1693ffc74edbb50d6138517fe5cd64fd1c917709",
            "currencyAddresses": ["0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"],
            "orderbookContractAddress": "0xB537a160472183f2150d42EB1c3DD6684A55f74c",
            "tokenIDs": [
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
            ],
            "isListing": true,
            "priceSort": "DESC"
        })
    });
    const result = await res.json()

    const object: any = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    }

    console.log(result)

    const requestList: any = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    }
    result.orders.map(async (order: any) => {
      console.log('in this loop')
      object[order.tokenId] = Number(order.pricePerToken)
      // const res = await fetch(`https://metadata.sequence.app/tokens/${'polygon'}/${order.tokenContract}/${order.tokenId}`)
      // const json = await res.json()
      // console.log(json)
      // order.image = json[0].image
      // return order
      requestList[order.tokenId] = order.orderId
    })
    console.log(object)
    setTopOrders(object)
    setRequests(Object.values(requestList))
    }, 0)
  }, [loggedIn])

  const connect = async () => {
    const wallet = sequence.getWallet()
    const details = await wallet.connect({app: 'sequence-market-feed'})

    if(details.connected){
      setLoggedIn(true)
      //  new TickerBoard('.create-ticker')
    }
  }

  const fillOrder = async () => {
    const sequenceMarketInterface = new ethers.utils.Interface(SequenceMarketABI.abi)
    const wallet = await sequence.getWallet()
    const signer = await wallet.getSigner(137)

    const data = sequenceMarketInterface.encodeFunctionData(
      'acceptRequest', [requestId, 1, await wallet.getAddress(), [],[]]
    )

    const erc20Interface = new ethers.utils.Interface(["function approve(address spender, uint256 amount) public returns (bool)"])

    const dataApprove = erc20Interface.encodeFunctionData(
      'approve', ["0xB537a160472183f2150d42EB1c3DD6684A55f74c",1*10**6]
    )

    const txApprove = {
      to: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      data: dataApprove
    }

    const tx = {
      to: "0xB537a160472183f2150d42EB1c3DD6684A55f74c",
      data: data
    }

    const res = await signer.sendTransaction([txApprove,tx])
    console.log(res)
  }

  const mint = async () => {
    const wallet = sequence.getWallet()
    const signer = wallet.getSigner(137)
    const erc1155Interface = new ethers.utils.Interface(["function mint(address to, uint256 tokenId, uint256 amount, bytes data) returns ()"])

    const data = erc1155Interface.encodeFunctionData(
      'mint', [await wallet.getAddress(),selectedId,1,"0x00"]
    )

    const tx = {
      to: "0x1693ffc74edbb50d6138517fe5cd64fd1c917709",
      data: data
    }

    try {
      const res = await signer.sendTransaction([tx])
      console.log(res)
    }catch(err){
      console.log(err)
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
        tokenId: selectedId,
        quantity: quantity,
        expiry: expiry,
        currency: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        pricePerToken: price
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
  // const [flipBoard, setFlipBoard] = useState<any>()
  const [balance, setBalance] = useState({})
  const [quantity, setQuantity] = useState(null)
  const [price, setPrice] = useState(null)
  const [expiry, setExpiry] = useState(null)

  useEffect(() => {


    setTimeout(async () => {
      const indexer = new SequenceIndexer('https://polygon-indexer.sequence.app', 'c3bgcU3LkFR9Bp9jFssLenPAAAAAAAAAA')

      // try any account address you'd like :)
      const wallet = sequence.getWallet()
      const accountAddress = await wallet.getAddress()
      
      // query Sequence Indexer for all token balances of the account on Polygon
      const tokenBalances = await indexer.getTokenBalances({
        accountAddress: accountAddress,
        contractAddress: '0x1693ffc74edbb50d6138517fe5cd64fd1c917709',
        includeMetadata: true
      })
      console.log('tokens in your account:', tokenBalances)
      const object: any = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
      }

      tokenBalances.balances.map((token) => {
        object[token.tokenID] = 1
      })

      setBalance(object)
    }, 0)

//     console.log('creating ticker')
//     // setFlipBoard(null)
//     // var listItems = document.querySelectorAll('li');

//     // // Remove each <li> element
//     // listItems.forEach(function(item: any) {
//     //   item.parentNode.removeChild(item);
//     console.log(view)
//     // view ==0 && setFlipBoard(<div className='parent'>

//     //             {<ul className="create-ticker">
//     //                   <li style={{paddingTop: '20px !important'}}>{"MINT"}</li>
//     //               </ul>}
//     //               </div>)

//     if(view ==1) flipBoard = <div className='parent'>

//                 {<ul className="create-ticker-1">
//                       <li style={{paddingTop: '20px !important'}}>{"MARKET"}</li>
//                   </ul>}
//                   </div>

//      if(view ==2) flipBoard = <div className='parent'>

//      {<ul className="create-ticker-1">
//            <li style={{paddingTop: '20px !important'}}>{"SELL"}</li>
//        </ul>}
//        </div>
// if(view ==2){

// document.getElementById('create-ticker-1')
// const board = new Board(element)
// board.updateMessages(['Apple', 'Banana', 'Cherry'])
// }


//     if(view ==0) flipBoard = <div className='parent'>

//     {<ul className="create-ticker-2">
//           <li style={{paddingTop: '20px !important'}}>{"MINT"}</li>
//       </ul>}
//       </div>
//     // });    

//     new TickerBoard('.create-ticker')
//     new TickerBoard('.create-ticker-1')
//     new TickerBoard('.create-ticker-2')
  }, [view])

  return (
    <div className="App">
      {
        loggedIn ? 
          <>
          <br/>
          <br/>
          <span onClick={() => {setView(0);setSelectedId(null);}} style={{cursor: 'pointer', fontFamily: 'circular', color: 'black', paddingBottom: '5px', borderBottom: `${view == 0 ? '1' : '0'}px solid black`, display: 'inline-block'}}>mint</span>
          &nbsp;&nbsp;&nbsp;&nbsp;<span onClick={() => {setView(1);setSelectedId(null);}} style={{fontFamily: 'circular', cursor: 'pointer', color: 'black', paddingBottom: '5px', borderBottom: `${view == 1 ? '1' : '0'}px solid black`, display: 'inline-block'}}>market</span>
          &nbsp;&nbsp;&nbsp;&nbsp;<span onClick={() => {setView(2);setSelectedId(null);}} style={{fontFamily: 'circular', cursor: 'pointer', color: 'black', paddingBottom: '5px', borderBottom: `${view == 2 ? '1' : '0'}px solid black`, display: 'inline-block'}}>sell</span>
          {
              view == 0 
            ?
              <>
            <div className="parent">
              <TickerBoard
                messages={['MINT']}
                count={1}
                size={6}
                theme={'dark'}
              />
            </div>
                <p style={{color: 'black', fontFamily: 'circular'}}>✈️ choose your plane color</p>
                <Box justifyContent={'center'}>
                  <ColorPanels setSelectedId={setSelectedId} selectedId={selectedId}/>
                </Box> 
                <Box justifyContent={'center'}>
                  <Button disabled={selectedId == null} padding={"4"} label="mint" onClick={() => mint()}></Button>
                </Box>
              </>
            :
              view == 1 
            ? 
              <>
              <div className="parent">
              <TickerBoard
                  messages={['MARKET']}
                  count={1}
                  size={6}
                  theme={'dark'}
                />
              </div>
              <p style={{color: 'black', fontFamily: 'circular'}}>✈️ request the top order</p>

                <Box justifyContent={'center'}>
                  <ColorPanels requests={requests} setRequestId={setRequestId} market={true} colored={Object.values(topOrders)} setSelectedId={setSelectedId} selectedId={selectedId}/>
                </Box> 
                <Box justifyContent={'center'}>
                  <Button disabled={selectedId == null} padding={"4"} label="fulfill order" onClick={() => fillOrder()}></Button>
                  <Button disabled={selectedId == null} padding={"4"} label="view orderbook" onClick={() => createOrder()}></Button>
                </Box>  
              </>
            :
              <>
                <div className="parent">
                <TickerBoard
                    messages={['SELL']}
                    count={1}
                    size={6}
                    theme={'dark'}
                  />
                </div>
                <p style={{color: 'black', fontFamily: 'circular'}}>✈️ sell your plane</p>
                <Box justifyContent={'center'}>
                  <ColorPanels colored={Object.values(balance)} setSelectedId={setSelectedId} selectedId={selectedId}/>
                </Box> 
                <Box justifyContent={'center'}>
                  <Button disabled={selectedId == null} padding={"4"} label="create order" onClick={() => toggleModal(true)}></Button>
                </Box>  
              </>
            } 
            <br/>
            {/* <Box justifyContent={'center'}>
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
            </Box> */}
          </>
        :
        <>
          <br/>
          <br/>
          <div className="parent">
          <TickerBoard
              messages={['AVIATOR', "HANGAR!"]}
              count={2}
              size={7}
              theme={'dark'}
            />
          </div>
          <br/>
          <Box>
            <Button variant="primary" padding={"4"} label="connect" onClick={() => connect()}></Button>
          </Box>
          
          <br/>
          <br/>
        </>
      }
            <AnimatePresence>
        {

          isOpen 
            && 
            <Modal  onClose={() => toggleModal(false)}>

                <Box
                  flexDirection="column"
                  justifyContent="space-between"
                  height="full"
                  padding="16"
                >

                    <Box marginTop="5" marginBottom="4">
                      <br/>
                      <Text variant="normal" color="text80">
                        Enter your email to recieve a code to login{!true ? ` and create your wallet` : null }. Please check your spam folder if you don't see it
                        in your inbox.
                      </Text> 
                      <br/>
                      <br/>
                      <BasicDateTimePicker setExpiry={setExpiry}/>
                      <br/>
                      <br/>
                      {/* struct RequestParams {
                          bool isListing; // True if the request is a listing, false if it is an offer.
                          bool isERC1155; // True if the token is an ERC1155 token, false if it is an ERC721 token.
                          address tokenContract;
                          uint256 tokenId;
                          uint256 quantity;
                          uint96 expiry;
                          address currency;
                          uint256 pricePerToken;
                        } */}
                      <TextInput placeholder="quantity" onChange={(value: any) => setQuantity(value.target.value)}/>
                      <br/>
                      <TextInput placeholder="price" onChange={(value: any) => setPrice(value.target.value)}/>
                      <br/>
                      <Box justifyContent={'center'}>
                        <Button disabled={selectedId == null} padding={"4"} label="submit" onClick={() => createOrder()}></Button>
                      </Box>  
                    </Box>
                </Box>
            </Modal>
        }

          </AnimatePresence>
    </div>
  );
}

export default App;
