/* eslint-disable */

import axios from 'axios';
import {useState, useEffect} from 'react';
import Comment from './components/Comment'


import dotenv from 'dotenv';

const url = process.env.REACT_APP_API_URL;

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

  useEffect(() => {
    const makeGetRequest = async () => {
      setLoading(true);
      let queryString = '';
      if(sortItem !== ''){
        queryString =`/comments?page=${page}&limit=${limit}&sortTerm=${sortItem}&sortDir=${sortDir}`;
      }
      else{
        queryString = `/comments?page=${page}&limit=${limit}`;        
      }
      let res = await axios.get(queryString)
      console.log("Query: ", queryString);
      let data = res.data;
      console.log("Res: ", res);
      setSavedComments(data);
      setLoading(false);
    }
    makeGetRequest();
  }, [page, limit, sortItem, sortDir]);


  return (
    <div className="App">
      <header>
        SaverBot Collection
      </header>

      <select onChange={handleLimit}>
        <option value="5">Number of Results</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>

      <div>
      Sort Criteria<br />

      <select onChange={handleSortTerm}>
        <option value="null">None</option>
        <option value="date">Date</option>
        <option value="user">Username</option>
      </select>

      in

      <select onChange={handleSortDir}>
        <option value="ASC">Ascending</option>
        <option value="DESC">Descending</option>
      </select>

      order

      </div>



      { loading === true ? null : Object.entries(JSON.parse(savedComments.results)).map((d:Array<any>, i) => {
        return <Comment key={d[1].id} id={d[1].id} comment={d[1].comment} timestamp={d[1].date} user={d[1].user}/>;
      })
      }

      {savedComments.previous ? <button  onClick={handlePrevClick}>Prev</button> : null}
      {savedComments.next ? <button onClick={handleNextClick}>Next</button> : null}
      




    </div>
  );
}

export default App;
