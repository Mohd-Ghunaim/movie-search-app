import { useState,useEffect } from 'react'
import { useDebounce } from 'react-use'
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
  const [errorMessage, setErrorMessage] = useState('');
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState('');
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState('');

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
    } catch (error) {
      console.log('Error fetching movies:', error);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

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

        <section className="all-movies">
          <h2>All Movies</h2>

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