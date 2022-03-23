/* eslint-disable */

import axios from 'axios';
import {useState, useEffect} from 'react';
import Comment from './components/Comment'

import './App.css'


import dotenv from 'dotenv';

const url = process.env.REACT_APP_API_URL || 'http://localhost:5001';

type Next = {
  page: number;
  limit: number;
}

type Prev = {
  page: number;
  limit: number;
}

interface ResultItem {
  id: number; comment: string; user?: string;
}


interface CommentsInterface {
  next?: Next,
  previous?: Next,
  results?: any,
}





function App() {

  const [savedComments, setSavedComments] = useState<CommentsInterface>({});
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);

  const [sortItem, setSortItem] = useState<string>('');
  const [sortDir, setSortDir] = useState<string>('ASC');
  const [query, setQuery] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  const handleNextClick = () => {
    console.log("Next");
    setPage(page+1);
  }

  const handlePrevClick = () => {
    console.log("Prev");
    setPage(page-1);
  }

 const handleLimit = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newLimit = Number(event.target.value);
      setPage(0);
      setLimit(newLimit);

  }

  const handleSortTerm = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTerm = event.target.value.toString();

    switch(newTerm) {
    case "date":
      setSortItem("date");
      break;
    case "user":
      setSortItem("user");
      break;
    default:
        setSortItem('');
    }
  }

  const handleSortDir = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDir = event.target.value.toString();
    setSortDir(newDir);

  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value.toString();
    setQuery(newSearch);
  }

  useEffect(() => {

    const searchTimeout = setTimeout(() => setSearchValue(query), 500);


    const makeGetRequest = async () => {
      setLoading(true);
      let queryString = '';
        queryString = `http://localhost:5001/comments?page=${page}&limit=${limit}&sortTerm=${sortItem}&sortDir=${sortDir}&search=${searchValue}`;        
      let res = await axios.get(queryString)
      console.log("Query: ", queryString);
      let data = res.data;
      console.log("Res: ", res);
      setSavedComments(data);
      setLoading(false);
    }
    const apiTimeout = setTimeout(makeGetRequest, 700);

      return () => {

        clearTimeout(apiTimeout);        
        clearTimeout(searchTimeout);
      }
  }, [page, limit, sortItem, sortDir, query, searchValue]);


  return (
    <div className="App">
      <header className="text-center bg-gray-200 lg:fixed top-0 right-0 left-0 shadow p-2 bg-white">


        <div className="controls flex p-3 justify-between items-center">

        <div className="max-w-sm w-full ">
          <select className="px-3 border" onChange={handleLimit}>
          <option value="5">Number of Results</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          </select>
        </div>

        <input  className="border px-3 py-2 max-w-md w-full placeholder-current" onChange={handleSearch} value={query} placeholder="Search Records"/>
        

        <div className="flex  max-w-sm w-full ">
            Sort Criteria:
            <div>
            <span className="border inline-block mx-2">
              <select onChange={handleSortTerm}>
                <option value="null">None</option>
                <option value="date">Date</option>
                <option value="user">Username</option>
              </select>
            </span>
          <span>in</span>
            <span className="border inline-block mx-2">
              <select onChange={handleSortDir}>
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </span>
            <span>order</span>
          </div>

        </div>

        </div>
      </header>





        <main className="pt-8 pb-4 lg:pt-32 max-w-3xl mx-auto">

                <h1 className="text-center">SaverBot Collection</h1>


      { loading === true ? null : Object.entries(JSON.parse(savedComments.results)).map((d:Array<any>, i) => {
        return <Comment key={d[1].id} id={d[1].id} comment={d[1].comment} timestamp={d[1].date} user={d[1].user}/>;
      })
      }

      <div className="bottom-controls flex justify-between">{savedComments.previous ? <button className="button" onClick={handlePrevClick}>Prev</button> : <span></span>}
            {savedComments.next ? <button  className="button" onClick={handleNextClick}>Next</button> : <span></span>}</div>
      </main>




    </div>
  );
}

export default App;
