import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import express from "express";
import { GraphQLScalarType, Kind, GraphQLError } from "graphql";
import { addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import getUser from "./auth.js";

const typeDefs = `#graphql

    "A custom scalar value for representing Dates"
    scalar Date

    "An interface for mutation responses"
    interface MutationResponse {
        "The status code of the mutation"
        code: String!
        "Whether the mutation was successful or not"
        success: Boolean!
        "A response message"
        message: String!
    }

    "The blockchain network that a property is stored on."
    enum Network {
        ETHEREUM
        SOLANA
        CARDANO
    }

    "The possible statuses of a piece of property"
    enum Status {
        OFF_MARKET
        FOR_SALE
    }

    "The possible zoning types for a piece of property"
    enum Zoning {
        SINGLE_FAMILY
        MULTI_FAMILY
        COMMERCIAL
    }

    "The possible features for a piece of property"
    enum Features {
        WATERFRONT
        NEAR_PARK
        ROAD_FRONTAGE
    }

    "An xy coordinate within the metaverse grid"
    type Coordinate {
        "The x axis of the coordinate"
        x: Int!
        "The y axis of the coordinate"
        y: Int!
    }

    "A User object in our schema"
    type User {
        "The unique ID of the user"
        id: ID!
        "The user's first name"
        firstName: String
        "The user's last name"
        lastName: String
        "The user's email address"
        email: String
        "The user's wallet Address"
        walletAddress: String!
        "The properties that the user owns"
        properties: [Property!]!
        "The number of properties that the user owns"
        propertyCount: Int!
    }

    "An input type for updating user information"
    input UpdateUserInput {
        "Updates the first name of the user"
        firstName: String
        "Updates the last name of the user"
        lastName: String
        "Updates the email of the user"
        email: String
    }

    type Sale {
        "The unique ID of the transaction"
        id: ID!
        "The ID of the property sold"
        propertyId: ID!
        "The date of the transaction"
        date: Date!
        "The amount of the transaction in the network's native token"
        price: Float!
        "The seller's wallet address"
        seller: String!
        "The buyer's wallet address"
        buyer: String!
    }

    "A property in the metaverse"
    interface Property {
        "The property's unique identifier"
        id: ID!
        "The network that the property is on"
        network: Network!
        "The parcel number that identifies the property in the metaverse plat book"
        parcelNumber: Int!
        "An ordered list of the sale history starting with the first and ending with the most recent sale"
        saleHistory: [Sale!]!
        "The current listing status of the property"
        status: Status!
        "A description of the property boundaries listing every corner outlining the property, starting and ending with the same coordinate"
        propertyBoundary: [Coordinate!]!
        "The current asking price for the property if listed for sale, in the network's native token"
        askingPrice: Float
        "The number of blocks contained within the property's boundaries, properties must be at least 2x2"
        propertySize: Int!
        "The possible uses for this property"
        restrictions: [Zoning!]!
        "The features of this property"
        features: [Features!]!
        "A description of this property"
        description: String
    }

    type Land implements Property {
        "The property's unique identifier"
        id: ID!
        "The network that the property is on"
        network: Network!
        "The parcel number that identifies the property in the metaverse plat book"
        parcelNumber: Int!
        "An ordered list of the sale history starting with the first and ending with the most recent sale"
        saleHistory: [Sale!]!
        "The current listing status of the property"
        status: Status!
        "A description of the property boundaries listing every corner outlining the property, starting and ending with the same coordinate"
        propertyBoundary: [Coordinate!]!
        "The current asking price for the property if listed for sale, in the network's native token"
        askingPrice: Float
        "The number of blocks contained within the property's boundaries, properties must be at least 2x2"
        propertySize: Int!
        "The possible uses for this property"
        restrictions: [Zoning!]!
        "The features of this property"
        features: [Features!]!
        "A description of this property"
        description: String
    }

    type House implements Property {
        "The property's unique identifier"
        id: ID!
        "The network that the property is on"
        network: Network!
        "The parcel number that identifies the property in the metaverse plat book"
        parcelNumber: Int!
        "An ordered list of the sale history starting with the first and ending with the most recent sale"
        saleHistory: [Sale!]!
        "The current listing status of the property"
        status: Status!
        "A description of the property boundaries listing every corner outlining the property, starting and ending with the same coordinate"
        propertyBoundary: [Coordinate!]!
        "The current asking price for the property if listed for sale, in the network's native token"
        askingPrice: Float
        "The number of blocks contained within the property's boundaries, properties must be at least 2x2"
        propertySize: Int!
        "The possible uses for this property"
        restrictions: [Zoning!]!
        "The features of this property"
        features: [Features!]!
        "A description of this property"
        description: String
        "The number of blocks contained within the house"
        squareBlocks: Int!
        "The number of floors within the house"
        floors: Int!
        "The number of bedrooms within the house"
        beds: Int!
        "The number of bathrooms within the house"
        baths: Float!
    }

    type ApartmentUnit {
        "The units's unique identifier"
        id: ID!
        "The network that the property is on"
        network: Network!
        "The ID of the Apartment that the unit belongs in"
        apartment: ID!
        "The unit's number"
        unitNumber: Int!
        "The floor that the unit is on"
        floor: Int!
        "An ordered list of the sale history starting with the first and ending with the most recent sale"
        saleHistory: [Sale!]!
        "The current listing status of the apartment unit"
        status: Status!
        "The current asking price for the unit if listed for sale, in the network's native token"
        askingPrice: Float
        "The number of blocks contained within the unit"
        squareBlocks: Int!
        "The number of floors within the unit"
        floors: Int!
        "The number of bedrooms within the unit"
        beds: Int!
        "The number of bathrooms within the unit"
        baths: Float!
        "Whether or not the unit is a penthouse suite"
        penthouse: Boolean!
    }

    type Apartment implements Property {
        "The property's unique identifier"
        id: ID!
        "The network that the property is on"
        network: Network!
        "The parcel number that identifies the property in the metaverse plat book"
        parcelNumber: Int!
        "An ordered list of the sale history starting with the first and ending with the most recent sale"
        saleHistory: [Sale!]!
        "The current listing status of the property"
        status: Status!
        "A description of the property boundaries listing every corner outlining the property, starting and ending with the same coordinate"
        propertyBoundary: [Coordinate!]!
        "The current asking price for the property if listed for sale, in the network's native token"
        askingPrice: Float
        "The number of blocks contained within the property's boundaries, properties must be at least 2x2"
        propertySize: Int!
        "The possible uses for this property"
        restrictions: [Zoning!]!
        "The features of this property"
        features: [Features!]!
        "A description of this property"
        description: String
        "The number of blocks contained within the apartment"
        squareBlocks: Int!
        "The number of floors within the apartment"
        floors: Int!
        "A list of all the units within the apartment"
        units: [ApartmentUnit!]!
    }

    type UserMutationResponse implements MutationResponse {
         "The status code of the mutation"
         code: String!
        "Whether the mutation was successful or not"
        success: Boolean!
        "A response message"
        message: String!
        "The updated user object"
        user: User
    }

    type SalePropertyMutationResponse implements MutationResponse {
        "The status code of the mutation"
        code: String!
        "Whether the mutation was successful or not"
        success: Boolean!
        "A response message"
        message: String!
        "The updated property object"
        property: Property
    }

    type RezonePropertyMutationResponse implements MutationResponse {
        "The status code of the mutation"
        code: String!
        "Whether the mutation was successful or not"
        success: Boolean!
        "A response message"
        message: String!
        "The updated property object"
        property: Property
    }

    type Query {
        "Returns the current user or throws an authentication error"
        user: User
        "Returns all users"
        users: [User!]!
        "Returns a user by their ID"
        userById(userId: ID!): User
        "Returns all properties in the system"
        properties: [Property!]!
        "Returns all houses in the system"
        houses: [House!]!
        "Returns all apartments in the system"
        apartments: [Apartment!]!
        "Returns all apartment units in the system"
        apartmentUnits: [ApartmentUnit!]!
        "Returns all sales recorded"
        sales: [Sale!]!
        "Returns a property by it's ID"
        propertyById(propertyId: ID!): Property
    }

    type Mutation {
        "Updates user info and returns the updated user object"
        updateUser(userId: ID!, user: UpdateUserInput!): UserMutationResponse
        "Creates a transaction, takes the ID of the property and the buyer's wallet address"
        saleProperty(propertyId: ID!, buyerAddress: String!): SalePropertyMutationResponse
        "Rezones a property, takes the property ID and updated zoning array"
        rezoneProperty(propertyId: ID!, zoning: [Zoning!]!): RezonePropertyMutationResponse
    }
`;

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    // Invalid hard-coded value (not an integer)
    return null;
  },
});

const resolvers = {
  Date: dateScalar,
  Query: {
    user(parent, args, context) {
      if (!context.user) {
        throw new GraphQLError("An authenticated user is required.", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }
      return context.user;
    },
  },
};

const mocks = {
  Date: () => new Date(),
  Sale: () => ({
    seller: () => "2x71a0mw",
    buyer: () => "d47vq82l",
  }),
  House: () => ({
    description: () => "Beautiful property near the entertainment district",
  }),
  SalePropertyMutationResponse: () => ({
    code: "200",
    success: true,
    message: "Succesfully sold property",
  }),
};

const app = express();

const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: addMocksToSchema({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    mocks,
    preserveResolvers: true,
  }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization || "";

      const user = getUser(token);

      return { user };
    },
  })
);

const url =
  process.env.NODE_ENV === "production"
    ? "https://metaverse-realty.herokuapp.com/"
    : "http://localhost:4000";

const port = process.env.PORT || 4000;

await new Promise((resolve) => httpServer.listen({ port: port }, resolve));

console.log(`🚀 Server ready at ${url}`);
