import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_Id = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_Id = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_Id = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_Id);
const database = new Databases(client);


export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_Id, COLLECTION_Id, [
      Query.equal('searchTerm', searchTerm),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_Id, COLLECTION_Id, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_Id, COLLECTION_Id, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      });
    }
} catch (error) {
    console.error('Error updating search count:', error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_Id, COLLECTION_Id, [
      Query.limit(5),
      Query.orderDesc('count'),
    ]);
    return result.documents;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};