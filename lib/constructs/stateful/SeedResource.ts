import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsCustomResourceProps,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

type Ticker = "UBO" | "NBO" | "BCT" | "NCT" | "MCO2";
type Source = "TOUCAN" | "C3" | "MOSS" | "OTHER";
type Standard = "VCS" | "REGEN" | "OTHER";
type Registry = "VERRA" | "GOLD STANDARD" | "OTHER";
type Category =
  | "Agriculture & Forestry"
  | "Energy Industries"
  | "Ocean Capture"
  | "Chemical Industries"
  | "Waste Handling & Disposal"
  | "Other";

type DBString<T> = { S: T };
type DBNumber = { N: number };

interface BaseAsset {
  PK: DBString<string>;
  SK: DBString<string>;
  ticker: DBString<Ticker>;
  name: DBString<string>;
}
interface Pool extends BaseAsset {
  address: DBString<string>;
  source: DBString<Source>;
  category: DBString<Category>;
}
interface Vintage extends BaseAsset {
  year: DBNumber;
  address: DBString<string>;
  remainingSupply: DBNumber;
  supply: DBNumber;
}
interface Project extends BaseAsset {
  source: DBString<Source>;
  category: DBString<Category>;
  standard: DBString<Standard>;
  registry: DBString<Registry>;
  description: DBString<string>;
  rating: DBNumber;
  start: DBNumber;
  end: DBNumber;
  region: DBString<string>;
  country: DBString<string>;
  latitude: DBNumber;
  longitude: DBNumber;
  hectares: DBNumber;
  methodology: DBString<string>;
  sdgs: DBNumber[];
}
type Asset = Project | Pool | Vintage;

interface AssetPutRequest {
  PutRequest: {
    Item: Asset;
  };
}

interface SeedResourceProps {
  tableName: string;
  tableArn: string;
}

export class SeedResource extends AwsCustomResource {
  constructor(scope: Construct, id: string, props: SeedResourceProps) {
    super(scope, id, {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          [props.tableName]: getAssets(
            initialPools,
            initialProjects,
            initialVintages
          ),
        },
        physicalResourceId: PhysicalResourceId.of(props.tableName + "insert"),
      },
      logRetention: RetentionDays.ONE_WEEK,
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          sid: "DynamoWriteAccess",
          effect: Effect.ALLOW,
          actions: ["dynamodb:BatchWriteItem"],
          resources: [props.tableArn],
        }),
      ]),
    });
  }
}
const getAssets = (pools: Pool[], projects: Project[], vintages: Vintage[]) => {
  const itemsAsPutRequest: AssetPutRequest[] = [];
  const allAssets = [...pools, ...projects, ...vintages];
  allAssets.forEach((a) => itemsAsPutRequest.push({ PutRequest: { Item: a } }));
  return itemsAsPutRequest;
};

const initialPools: Pool[] = [
  {
    PK: { S: "asset#UBO" },
    SK: { S: "pool#UBO" },
    ticker: { S: "UBO" },
    name: { S: "Universal Basic Offset" },
    source: { S: "C3" },
    category: { S: "Other" },
    address: { S: "0x2B3eCb0991AF0498ECE9135bcD04013d7993110c" },
  },
  {
    PK: { S: "asset#NBO" },
    SK: { S: "pool#NBO" },
    ticker: { S: "NBO" },
    name: { S: "Nature Based Offset" },
    source: { S: "C3" },
    category: { S: "Agriculture & Forestry" },
    address: { S: "0x6BCa3B77C1909Ce1a4Ba1A20d1103bDe8d222E48" },
  },
  {
    PK: { S: "asset#BCT" },
    SK: { S: "pool#BCT" },
    ticker: { S: "BCT" },
    name: { S: "Base Carbon Tonne" },
    source: { S: "TOUCAN" },
    category: { S: "Other" },
    address: { S: "0x2F800Db0fdb5223b3C3f354886d907A671414A7F" },
  },
  {
    PK: { S: "asset#NCT" },
    SK: { S: "pool#NCT" },
    ticker: { S: "NCT" },
    name: { S: "Nature Carbon Tonne" },
    source: { S: "TOUCAN" },
    category: { S: "Agriculture & Forestry" },
    address: { S: "0xD838290e877E0188a4A44700463419ED96c16107" },
  },
  {
    PK: { S: "asset#MCO2" },
    SK: { S: "pool#MCO2" },
    ticker: { S: "MCO2" },
    name: { S: "Moss Carbon Token" },
    source: { S: "MOSS" },
    category: { S: "Agriculture & Forestry" },
    address: { S: "0xAa7DbD1598251f856C12f63557A4C4397c253Cea" },
  },
];

const initialProjects: Project[] = [
  {
    PK: { S: "asset#NCT" },
    SK: { S: "project#VCS-612" },
    ticker: { S: "NCT" },
    name: {
      S: "The Kasigau Corridor REDD Project - Phase II The Community Ranches",
    },
    source: { S: "TOUCAN" },
    category: { S: "Agriculture & Forestry" },
    standard: { S: "VCS" },
    registry: { S: "VERRA" },
    description: {
      S: "This project builds on Wildlife Works' first REDD project (Phase I, Rukinga Ranch) which has been protecting forests, flora and fauna since 2006. The aim of this new, larger project is to bring the benefits of direct carbon financing to surrounding communities, while simultaneously addressing alternative livelihoods and protecting vital flora and fauna. Human-wildlife conflict has been a problem in the past, as local agents are directly reliant on the environment as a means for subsistence. This Phase II project directly addresses such sources of conflict in a holistic, sustainable approach, and on a large scale. This Phase II project is classified by VCS as a mega-project, as it is estimated to reduce over 1 million tonnes of CO2-e per year.",
    },
    rating: { N: 5 },
    start: { N: 2010 },
    end: { N: 2039 },
    region: { S: "Coast Province" },
    country: { S: "Kenya" },
    latitude: { N: -3.917672 },
    longitude: { N: 38.805574 },
    hectares: { N: 169741 },
    methodology: { S: "VM0009" },
    sdgs: [
      { N: 1 },
      { N: 2 },
      { N: 3 },
      { N: 4 },
      { N: 5 },
      { N: 6 },
      { N: 8 },
      { N: 10 },
      { N: 12 },
      { N: 13 },
      { N: 15 },
      { N: 16 },
      { N: 17 },
    ],
  },
];

const initialVintages: Vintage[] = [
  {
    PK: { S: "asset#NCT" },
    SK: { S: "project#VCS-612#2010" },
    address: { S: "0xb8802c009dd265b38e320214a7720ebd7a488827" },
    ticker: { S: "NCT" },
    name: {
      S: "The Kasigau Corridor REDD Project - Phase II The Community Ranches",
    },
    year: { N: 2010 },
    supply: { N: 8002 },
    remainingSupply: { N: 350.4287019 },
  },
];
