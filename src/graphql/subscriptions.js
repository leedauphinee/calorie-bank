/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateEntry = `subscription OnCreateEntry(
  $id: ID
  $difference: Int
  $publishedAt: AWSDateTime
) {
  onCreateEntry(id: $id, difference: $difference, publishedAt: $publishedAt) {
    id
    difference
    publishedAt
  }
}
`;
export const onUpdateEntry = `subscription OnUpdateEntry(
  $id: ID
  $difference: Int
  $publishedAt: AWSDateTime
) {
  onUpdateEntry(id: $id, difference: $difference, publishedAt: $publishedAt) {
    id
    difference
    publishedAt
  }
}
`;
export const onDeleteEntry = `subscription OnDeleteEntry(
  $id: ID
  $difference: Int
  $publishedAt: AWSDateTime
) {
  onDeleteEntry(id: $id, difference: $difference, publishedAt: $publishedAt) {
    id
    difference
    publishedAt
  }
}
`;
