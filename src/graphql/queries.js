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
  listEntries(limit: 1000) {
    items {
      id
      difference
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
export const listEntries = `query ListEntries(
  $filter: TableEntryFilterInput
  $limit: Int
  $nextToken: String
) {
  listEntries(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      difference
      publishedAt
    }
    nextToken
  }
}
`;
