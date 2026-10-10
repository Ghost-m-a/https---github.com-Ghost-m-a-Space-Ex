export function withId<T extends { _id: any }>(doc: T) {
   return { ...doc, id: String(doc._id) };
}

export function withIdArray<T extends { _id: any }>(docs: T[]) {
   return docs.map(withId);
}
