import { WebSocket } from "ws";
import { BinanceData } from "./binancedata";

const cryptoPair = 'btcusdt' 

// <symbol>@bookTicker 
// https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md#individual-symbol-book-ticker-streams
const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${cryptoPair}@bookTicker`);

socket.on('open', function() { console.log('Socket listening for ' + cryptoPair) });
socket.on('error', function() { console.log('Socket error'); });
socket.on('close', function() { console.log('Socket close'); });

let oldCurrency : number = 0;

socket.addEventListener('message', (event) =>{
    const dataReceived: BinanceData = JSON.parse(event.data) as BinanceData;
    const nameCrypto : string = dataReceived.s;
    
    if (nameCrypto.toLowerCase() !== cryptoPair) {
        return;
    }
    
    const actualCurrency : number = Number(dataReceived.b);
    if (!oldCurrency) {
        oldCurrency = actualCurrency;
    }

    const factor : number = ((actualCurrency - oldCurrency) / oldCurrency);
    const rate : number = 0.0001; // i want to be notified when the value changes by 0.01%

    if (factor > rate || factor < -rate) {
        console.log(`${nameCrypto} changed by ${(factor * 100).toFixed(4)}%, old Value: ${oldCurrency}, new Value: ${actualCurrency}`);
        oldCurrency = actualCurrency;
    }
});