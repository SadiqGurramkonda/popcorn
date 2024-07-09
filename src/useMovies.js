import { useState,useEffect } from "react";

const KEY = "61879b62";

export function useMovies(query, callback){
    
    const [movies, setMovies] = useState([]);
    const [isLoading,setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(function () {

        //optional chaining with callling function:
        // callback?.()
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

    return {movies,isLoading,error};
}