/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const putEntry = `mutation PutEntry($id: ID!, $difference: String!) {
  putEntry(id: $id, difference: $difference) {
    id
    difference
    publishedAt
  }
}
`;
export const createEntry = `mutation CreateEntry($input: CreateEntryInput!) {
  createEntry(input: $input) {
    id
    difference
    publishedAt
  }
}
`;
export const updateEntry = `mutation UpdateEntry($input: UpdateEntryInput!) {
  updateEntry(input: $input) {
    id
    difference
    publishedAt
  }
}
`;
export const deleteEntry = `mutation DeleteEntry($input: DeleteEntryInput!) {
  deleteEntry(input: $input) {
    id
    difference
    publishedAt
  }
}
`;
