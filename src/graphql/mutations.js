/* eslint-disable */
// this is an auto generated file. This will be overwritten
import gql from "graphql-tag";
export const putEntry = `mutation PutEntry($id: ID!, $difference: String!) {
  putEntry(id: $id, difference: $difference) {
    id
    difference
    publishedAt
  }
}
`;

export const createEntry = gql(`
mutation ($difference: Int!, $publishedAt: AWSDateTime!) {
  createEntry(input: {difference: $difference, publishedAt: $publishedAt}) {
      id
      difference
      publishedAt
    }
}`);

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
