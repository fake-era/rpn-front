import './App.css';
import MyButton from './components/UI/MyButton';
import MyInput from './components/UI/MyInput';
import { useState } from 'react';
import axios from 'axios'

function App() {
  const [iin, setIin] = useState('');
  const [iinDirty, setIinDirty] = useState(false)
  const [iinError, setIinError] = useState('ИИН не может быть пустым')
  const [result, setResult] = useState()
  const [taskState, setTaskState] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [err, setErr] = useState('');
  const [btnState, setBtnState] = useState(true)

  const handleSubmit = (e) => {
    if (iin.length===12) {
      e.preventDefault();
    } else {
      e.preventDefault();
      console.log('Error. Incorrect IIN')
    }
  }

  const addTask = async () => {
    let addTaskResult;
    try {
      const response = await axios.post('http://localhost:8000/api/v1/task/', {
      iin: iin
      });
      const result = await response.data;
      addTaskResult = result;
    } catch (err) {
      console.error(err.message)
    } finally {
      if (addTaskResult === false) {
        setTaskState('done')
        await getResult()
      } else {
        setTaskState('pending')
        await getTask()
      }
    }
  }

  const handleClick = () => {
    setErr('')
    setIsLoading(true);
    addTask()
  }

  const getTask = async () => {
    try {
      const response = await axios(`http://localhost:8000/api/v1/task?iin=${iin}`);
      const result = await response.data;
      setTaskState(result.status)
    } catch (err) {
      setErr(err.message)
      console.error(err.message)
    } finally {
      if (taskState === 'done') {
        await getResult()
      } else {
        setTimeout(getTask, 5000)
      }
    }
  }

  const getResult = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/person?iin=${iin}`);
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const result = await response.json()
      if (result===null) {
        setResult('error')
      } else {
        setResult(result)
      }
    } catch (err) {
      setErr(err.message)
    }
  }

  const blurHandler = (e) => {
    switch (e.target.name) {
      case 'iin':
        setIinDirty(true)
        break
      default:
        break
    }
  }

  const iinHandler = (e) => {
    setIin(e.target.value)
    if (e.target.value.length===0) {
      setIinError('')
      setBtnState(true)
    } else if (e.target.value.length>12) {
      setBtnState(true)
      setIinError('ИИН больше 12 символов')
    } else if (e.target.value.length<12) {
      setBtnState(true)
      setIinError('ИИН меньше 12 символов')
    } else {
      setBtnState(false)
      setIinError('')
    }
  }

  const excludeCreate = (result) => {
    if (result.exclude_status === null) {
      return ""
    } else {
      return (
        <li className='mb-2' key={`exclude_status ${Date.now}`}>
          <strong className='text-lg'>Дата смерти: </strong><br />
          <p>{result.exclude_status}</p>
        </li>
      )
    }
  }

  const createResult = (result) => {
    setIsLoading(false)
    if (result === 'Человек не найден') {
      return (
        <h3 className='text-2xl mb-3 text-rose-600'>
            {result}
        </h3>
      )
    } else {
      return (
        <div>
            <h3 className='text-2xl mb-3'>
              Результаты поиска:
            </h3>
            <ul className='px-2 py-2 border rounded border-black'>
              <li className='mb-2' key={`categories_osms ${Date.now}`}>
                <strong className='text-lg'>Категория ОСМС: </strong><br />
                <p>{result.categories_osms}</p>
              </li>
              <li className='mb-2' key={`status_osms ${Date.now}`}>
                <strong className='text-lg'>Статус ОСМС: </strong><br />
                <p>{result.status_osms}</p>
              </li>
              <li className='mb-2' key={`numbers ${Date.now}`}>
                <strong className='text-lg'>Номеры: </strong><br />
                <p>{result.numbers}</p>
              </li>
              <li className='mb-2' key={`relatives ${Date.now}`}>
                <strong className='text-lg'>Родственники: </strong><br />
                <p>{result.relatives}</p>
              </li>
              <li className='mb-2' key={`address ${Date.now}`}>
                <strong className='text-lg'>Адресы: </strong><br />
                <p>{result.address}</p>
              </li>
              {excludeCreate(result)}
              <li className='mb-2' key={`date at ${Date.now}`}>
                <strong className='text-lg'>Данные на момент: </strong><br />
                <p>{result.data_at}</p>
              </li>
            </ul>
        </div>
      )
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="search">
          <h1 className='text-4xl mt-8'>
            RPN
          </h1>
          <form onSubmit={handleSubmit} className='w-max py-2'>
            {err && <h2>{err}</h2>}
            {(iinDirty && iinError) && <div className='text-rose-700'>{iinError}</div>}
            <MyInput
              name='iin'
              type="text"
              placeholder="Введите ИИН"
              value={iin}
              onBlur={e => blurHandler(e)}
              onChange={e => iinHandler(e)}
            />
            <MyButton onClick={handleClick} disabled={btnState}>Поиск</MyButton>
          </form>
          <div className="result mt-5 mb-5">
            {isLoading && <h2>Loading...</h2>}
            {result && (createResult(result))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
