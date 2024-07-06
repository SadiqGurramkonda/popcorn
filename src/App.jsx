import { useEffect, useState } from 'react'
import StarRating from './StarRating';
import Challenge1 from './Challenge';
import './App.css'

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "61879b62";

const MOVIE = "Gabbar Singh"

export function App() {

  const [query, setQuery] = useState("Gabbar Singh");

  const [movies, setMovies] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [erorr, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  // const [watched, setWatched] = useState([]);

  //setting the initial state using a function
  const [watched, setWatched] = useState(function(){
    const storedData = JSON.parse(localStorage.getItem("watched"));
    return storedData

  });
  
  function handleSelectMovie(id){
    setSelectedId((prevId)=>id===prevId?null:id);
  }

  function handleCloseMovie(){
    setSelectedId(null)
  }

  function handleAddWatched(movie){
    setWatched(watched=>[...watched,movie]);
  }

  function handleDeleteWatched(id){
    console.log(id);
    setWatched((watched)=>watched.filter(movie=>movie.imdbID!==id));
  }



  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );


  //way to use async function inside of an useEffect hook:

  useEffect(function () {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setError("");
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=61879b62&s=${query}`,
          {signal:controller.signal}
        );
        if (!res.ok)
          {throw new Error("Something went wrong, couldn't fetch movies")};
        const data = await res.json();
        if(data["Response"] === "False"){
          throw new Error("couldn't find the movie...");
        }
        setMovies(data.Search);
        setError("")
      } catch (err) {
        if(err.name !== "AbortError")
        setError(err.message); 
      }
      finally{
        setIsLoading(false);
      }
    }

    fetchMovies();

    return function(){
      controller.abort()
    }

  },[query]);
  
  return (
    <>
      <Navbar>
        <SearchBar query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {erorr && <ErrorMessage error={erorr}></ErrorMessage>}
          {!isLoading && !erorr && <MovieList  movies={movies} onSelectMovie={handleSelectMovie}  />}
          {isLoading && <Loader />}
        </Box>
        <Box>
          {selectedId?<MovieDetails 
          selectedId={selectedId}  
          onCloseMovie={handleCloseMovie} 
          onAddWatched={handleAddWatched}
          watched={watched}
          />:
          <>
            <WatchedSummary watched={watched} />
            <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
          </>}
        </Box>
      </Main>
      {/* <StarRating  onSetRating={setMovieRating} color='indigo'/>
      <p>The movie is rated {movieRating}</p>
      {/* <Challenge1 /> */}
    </>
  );
}

function ErrorMessage({error}){

  return(
    <div className='error'>
      {error}
    </div>
  )
}

function Loader(){
  return(
    <div className='loader'>
      loading...
    </div>
  )
}


function Navbar({children}){
  
  return(
    <nav className="nav-bar">
      <Logo />
     {children}
    </nav>
  )
}

function Logo(){

  return(
    <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
    </div>
  )
}

function SearchBar({query,setQuery}){


  return(
    <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
  )
}

function NumResults({movies}){
  
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({children}){

  return(
    <main className="main">
      {children}
    </main>
  )
}

function Box({children}){
  
  const [isOpen, setIsOpen] = useState(true);
  

  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && children}
        </div>
  )
}

// function WatchedBox(){

  
//   const [isOpen2, setIsOpen2] = useState(true);

  
//   return(
//     <div className="box">
//           <button
//             className="btn-toggle"
//             onClick={() => setIsOpen2((open) => !open)}
//           >
//             {isOpen2 ? "–" : "+"}
//           </button>
//           {isOpen2 && (
//             <>
//               <WatchedSummary watched={watched}  />
//               <WatchedMovieList watched={watched} />
//             </>
//           )}
//         </div>
//   )
// }

function MovieList({movies,onSelectMovie}){


  return(
    <ul className="list list-movies">
              {movies?.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
              ))}
            </ul>
  )
}

function Movie({movie,onSelectMovie}){

  return (
    <li key={movie.imdbID} onClick={()=>{onSelectMovie(movie.imdbID)}}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({selectedId , onCloseMovie, onAddWatched,watched}){

  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [userRating, setUserRating] = useState(0);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;

  const isWatched = watched.map(movie=>movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find((movie)=>movie.imdbID === selectedId)?.userRating



// shoudn't call a Hook conditionally
  // if(imdbRating>8) [isTop, setIsTop] = useState(true);


// const [avgRating, setAvgRating] = useState(0);

  function handleAdd(){
    const newWatachedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating
    };

    onAddWatched(newWatachedMovie);

    //an example, using the state right after setting it!
    // setAvgRating(Number(imdbRating))
    // setAvgRating((avgRating)=>(avgRating+userRating) / 2)
    onCloseMovie();
  }

  useEffect(function(){

    async function getMovieDetails(){
      setIsLoading(true);
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=61879b62&i=${selectedId}`
      );
      const data = await res.json();
      setMovieDetails(data);
      setIsLoading(false);
    }
    getMovieDetails()
  },[selectedId]);

  useEffect(function(){
    if(!title){
      return
    }
    document.title = `Movie |  ${title}`

    return ()=>{
      document.title = "Popcorn"
    }
  },[title])

  useEffect(function(){

    function callback(e){
      if(e.code ==="Escape"){
        onCloseMovie();
        console.log("CLOSING")
      }
    }
    document.addEventListener("keydown",callback);

    // return function(){
    //   document.removeEventListener("keydown",callback);
    // }
  })


  
  return(
    <div className='details'>
      {isLoading?<Loader/>:
      <>
      <header>
      <button className='btn-back' onClick={onCloseMovie}>&larr;</button>
      <img src={poster} alt={title} />
      <div className="details-overview">
        <h2>
          {title}
        </h2>
        <p>
          {released} &bull; {runtime}
        </p>
        <p>{genre}</p>
        <p><span>⭐️</span>{imdbRating}&nbsp;IMDb rating</p>
      </div>
      </header>
      <section>
      {/* <p>{avgRating}</p> */}
        <div className="rating">
          {!isWatched?
          <><StarRating size={20} maxStarRating={10} color='gold' onSetRating={setUserRating} />
          {userRating !== 0 &&  <button className='btn-add' onClick={handleAdd}>+ Add to list</button>}
          </>
        :<p>You rated this movie {watchedUserRating} <span>⭐️</span></p>}

        </div>
        <p><em>{plot}</em></p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </>}
    </div>
  )
}



function WatchedMovieList({watched, onDeleteWatched}){

  return(
    <ul className="list" key={crypto.randomUUID()}>
                {watched.map((movie) => ( 
                  <WatchedMovie movie={movie} key={movie.Title} onDeleteWatched={onDeleteWatched}/>
                ))}
    </ul>
  )
}

function WatchedMovie({movie, onDeleteWatched}){
  return(
    <li key={movie.imdbID}>
                    <img src={movie.poster} alt={`${movie.title} poster`} />
                    <h3>{movie.title}</h3>
                    <div>
                      <p>
                        <span>⭐️</span>
                        <span>{movie.imdbRating}</span>
                      </p>
                      <p>
                        <span>🌟</span>
                        <span>{movie.userRating}</span>
                      </p>
                      <p>
                        <span>⏳</span>
                        <span>{movie.runtime} min</span>
                      </p>
                      <button className='btn-delete' onClick={()=>{onDeleteWatched(movie.imdbID)}}>X</button>
                    </div>
                  </li>
  )
}


function WatchedSummary({watched}){
  // console.log(watched)


  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));


  return(
    <div className="summary">
                <h2>Movies you watched</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime.toFixed(2)} min</span>
                  </p>
                </div>
              </div>
  )
}



export default App
