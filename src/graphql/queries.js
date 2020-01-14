import gql from "graphql-tag";
export const singleEntry = `query SingleEntry($id: ID!) {
  singleEntry(id: $id) {
    id
    difference
    publishedAt
  }
}
`;

export const entries = gql(`
query {
  listEntry2S(limit: 1000) {
    items {
      id
      difference
      userId
      publishedAt
    }
  }
}`);

export const getEntry = `query GetEntry($id: ID!) {
  getEntry(id: $id) {
    id
    difference
    publishedAt
  }
}
`;
export const listEntries = `query ListEntry2S(
  $filter: TableEntry2FilterInput
  $limit: Int
  $nextToken: String
) {
  listEntry2S(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      difference
      userId
      publishedAt
    }
    nextToken
  }
}
`;
