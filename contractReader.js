// // Import required dependencies using CommonJS syntax
// const { 
//     callReadOnlyFunction,
//     cvToValue,
//     standardPrincipalCV,
//     uintCV,
//   } = require('@stacks/transactions');
const { StacksMainnet, StacksTestnet } = require('@stacks/network');

// const fetch = require('node-fetch');

// Function to read contract data
//   async function readContractData({
//     network = new StacksTestnet(), // or StacksMainnet for mainnet
//     contractAddress,
//     contractName,
//     functionName,
//     functionArgs = [],
//     senderAddress
//   }) {
//     try {

//         if (network === undefined || contractAddress === undefined || contractName === undefined || functionName == undefined || functionArgs == undefined || senderAddress === undefined ) {
//             return console.error("no parms");

//         }

//       // Call the read-only function
//       const response = await callReadOnlyFunction({
//         network,
//         contractAddress,
//         contractName,
//         functionName,
//         functionArgs,
//         senderAddress,
//       });

//       // Convert the response to a JavaScript value
//       const result = cvToValue(response);
//       return result;
//     } catch (error) {
//       console.error('Error reading contract data:', error);
//       throw error;
//     }
//   }

// readContractData();

//   Example usage
// async function example() {
//   // Network setup (using testnet in this example)
//   const network = new StacksTestnet();

//   // Contract details
//   const contractAddress = 'ST1J2JTYXGRMZYNKE40GM87ZCACSPSSEEQVSNB7DC';
//   const contractName = 'brc20-db20';
//   const functionName = 'get-total-supply';
//   const senderAddress = 'ST2XN3J7Q6A1XW8QTM6TNZXXXABZVBCGQ8N8PT3N3';

//   // Example arguments (modify based on your contract function)
//   const functionArgs = [
//   ];

//   try {
//     const result = await callReadOnlyFunction({
//       network,
//       contractAddress,
//       contractName,
//       functionName,
//       functionArgs,
//       senderAddress
//     });

//     console.log('Contract data:', result);
//   } catch (error) {
//     console.error('Failed to read contract:', error);
//   }
// }

// // Run the example
// example();

const axios = require('axios');
// const { StacksMainnet, StacksTestnet } = require('@stacks/network');

async function getAllContractEvents({
  contractId,
  // network = new StacksMainnet(),
  batchSize = 50
}) {
  // const isMainnet = network instanceof StacksMainnet;
  // const baseUrl = isMainnet 
  //   ? 'https://api.hiro.so'
  //   : 'https://api.testnet.hiro.so';

  const baseUrl = 'https://api.hiro.so';

  let allEvents = [];
  let offset = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      // Construct the API endpoint URL with current offset
      const url = `${baseUrl}/extended/v1/contract/${contractId}/events`;
      const params = {
        limit: batchSize,
        offset: offset
      };

      console.log(`Fetching events ${offset} to ${offset + batchSize}...`);

      const response = await axios.get(url, { params });
      const events = response.data.results;

      if (events.length === 0) {
        hasMore = false;
      } else {
        allEvents = allEvents.concat(events);
        offset += batchSize;
      }

      // Optional: Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2));
    }

    return allEvents;
  } catch (error) {
    console.error('Error fetching contract events:', error);
    throw error;
  }
}

// Function to parse and format events
function formatEvent(event) {
  return {
    txId: event.tx_id,
    eventIndex: event.event_index,
    type: event.event_type,
    contractId: event.contract_id,

  };
}

// Example usage with event filtering options
async function example() {
  const network = new StacksMainnet(); // Use StacksMainnet() for mainnet

  // Replace with your contract's identifier
  const contractId = 'SP6P4EJF0VG8V0RB3TQQKJBHDQKEF6NVRD1KZE3C.satoshibles';

  try {
    console.log('Fetching all events...');
    const events = await getAllContractEvents({
      contractId,
      network,
      batchSize: 50  // Number of events per request
    });

    console.log(`\nTotal events found: ${events.length}`);

    // Optional: Filter events by type
    const contractEvents = events.filter(e => e.event_type === 'smart_contract_log');


    console.log('\nEvents by type:');
    console.log(`- Contract events: ${contractEvents.length}`);

    // const formattedEvent = formatEvent(contractEvents);
    // console.log("formatted event:", formattedEvent);


    // Print the latest 5 events as an example
    // console.log('\nLatest 5 events:');
    // events.forEach((event,index) => {
    //   const formattedEvent = formatEvent(event);
    //   console.log(`\nEvent ${index + 1}:`, JSON.stringify(formattedEvent, null, 2));
    // });

  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
}

// Run the example
example();