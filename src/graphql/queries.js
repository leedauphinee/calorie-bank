/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const singleEntry = `query SingleEntry($id: ID!) {
  singleEntry(id: $id) {
    id
    difference
    publishedAt
  }
}
`;
export const entries = `query Entries($limit: Int) {
  entries(limit: $limit) {
    id
    difference
    publishedAt
  }
}
`;
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
