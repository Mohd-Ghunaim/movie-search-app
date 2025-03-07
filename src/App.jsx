import { useState,useEffect, use } from 'react'
import { useDebounce } from 'react-use'
import { updateSearchCount, getTrendingMovies } from './appwrite.js'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

const [moviesList, setMoviesList] = useState([]);
const [trendingMovies, setTrendingMovies] = useState([]);

const [isLoading, setIsLoading] = useState('');
const [isTrendingLoading, setIsTrendingLoading] = useState('');

const [errorMessage, setErrorMessage] = useState('');

  useDebounce(
    () => setDebouncedSearchTerm(searchTerm), 
    1000, 
    [searchTerm]
  );
  

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?include_adult=false&include_video=false&language=en-US&page=1&query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      const data = await response.json();
      
      if (data.Response==='False') {
        setErrorMessage(data.Error|| 'Failed to fetch movies.'); 
        setMoviesList([]); 
        return;
      }

      setMoviesList(data.results || []);

      if (query && data.results.length > 0) {
          await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.log('Error fetching movies:', error);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    setIsTrendingLoading(true);
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    } finally {
      setIsTrendingLoading(false);
    }
  };

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient">Movies</span> You'll Like Without The Hassle</h1>
        
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
          <h2>Trending Movies</h2>
        
          {isTrendingLoading ? (
            <Spinner />
          ) : (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img 
                    src={movie.poster_url || './No-poster.png'} 
                    alt={movie.title || 'No Title Available'} 
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
        )}

        <section className="all-movies">
          <h2 className="">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
            <ul>
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App