import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import axios from "axios";

// Initialize DynamoDB Document client
const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const dbDoc = DynamoDBDocument.from(client);

type Ticker = "UBO" | "NBO" | "BCT" | "NCT" | "MCO2";
type SubgraphPair = {
    id: string;
    currentprice: string;
};
type AssetPriceItem = {
    PK: string;
    SK: string;
    ticker: Ticker;
    price: number;
    supply: number;
    timestamp: string;
}
type AssetPriceWriteRequest = {
    PutRequest: {
        Item: AssetPriceItem;
    }
}[];


const KLIMA_PAIRS_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/klimadao/klimadao-pairs";

const KLIMA_POLY_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/klimadao/polygon-bridged-carbon";

const KLIMA_PAIR_IDS: { [key: string]: Ticker } = {
  "0x5400a05b8b45eaf9105315b4f2e31f806ab706de": "UBO",
  "0x251ca6a70cbd93ccd7039b6b708d4cb9683c266c": "NBO",
  "0x1e67124681b402064cd0abe8ed1b5c79d2e02f64": "BCT",
  "0xdb995f975f1bfc3b2157495c47e4efb31196b2ca": "NCT",
  "0x64a3b8ca5a7e406a78e660ae10c7563d9153a739": "MCO2",
};

/**
 * Lambda function that polls the current price of each asset in the Klima ecosystem.
 * @returns {Promise<void>}
 */
export async function handler() {
  try {
    // Get current timestamp in ISO format
    const timestamp = new Date().toISOString();

    // Retrieve prices from Klima Subgraph
    const subgraphPairs = await axios.post(KLIMA_PAIRS_SUBGRAPH_URL, {
      query: "query {\npairs {\ncurrentprice\nid\n}\n}"
    });
    const pairs = subgraphPairs.data.data.pairs.filter(({ id }: SubgraphPair) => KLIMA_PAIR_IDS[id]);
        
    // Retrieve supply from Klima Subgraph
    const subgraphMetrics = await axios.post(KLIMA_POLY_SUBGRAPH_URL, {
      query: "query {\ncarbonMetrics(orderBy: timestamp, orderDirection: desc, first: 1) {\nbctSupply\nmco2Supply\nnboSupply\nnctSupply\nuboSupply\n}\n}"
    });
    const carbonMetrics: {[key: string]: string} = subgraphMetrics.data.data.carbonMetrics[0];
        
    // Map prices and supply to Asset Prices
    const putRequest: AssetPriceWriteRequest = pairs.reduce((acc: AssetPriceWriteRequest, { id, currentprice }: SubgraphPair) => {
      const ticker = KLIMA_PAIR_IDS[id] as Ticker;
      if (!ticker) return acc;
      const supply = +carbonMetrics[ticker.toLowerCase() + "Supply"];
      const price = +currentprice;
      if (supply && price) {
        acc.push({
          PutRequest: {
            Item: {
              PK: "asset#" + ticker,
              SK: "#" + timestamp,
              ticker,
              price,
              supply,
              timestamp
            }
          }
        });
      }
      return acc;
    }, []);

    console.log("---- PUT REQUEST ----");
    console.log(putRequest);

    // Write prices to DynamoDB
    const putResponse = await dbDoc.batchWrite({
      RequestItems: {
        "CoreTable": putRequest
      },
    });

    console.log("---- PUT RESPONSE ----");
    console.log(putResponse);
        
  } catch (error) {
    console.log(error);
  }
}