import React, { useState, useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import SurveyQuestions from "./SurveyQuestions.js";
import Results from "./Results.js";
import Intro from "./Intro.js";
import Fork from "./Fork.js";
import AdminPage from "./Admin.js";
import PasswordProtectedRoute from "./PasswordProtectedRoute.js";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const questionsPerPage = 1;

function ResultsWrapper(props) {
  const { report_uuid } = useParams();
  return <Results {...props} userUUID={report_uuid} />;
}
function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userUUID, setUserUUID] = useState("");
  const [isHeaderSet, setIsHeaderSet] = useState(false);
  const [answers, setAnswers] = useState({});
  const [textResponses, setTextResponses] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [set_id, setSetId] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");

  const front_end_port = window.location.port;
  let host_development = "";
  if (front_end_port === "3000") {
    host_development =
      "https://bite-model-app-stage-6e97f85a4713.herokuapp.com";
  }
  const handlePasswordSubmit = (password) => {
    setEnteredPassword(password);
  };

  function isLocalStorageAvailable() {
    var test = "test";
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  useEffect(() => {
    const ensureUserUUID = (searchParams) => {
      let userUUID = searchParams.get("userUUID");
      if (userUUID) {
        try {
          localStorage.setItem("userUUID", userUUID);
        } catch (error) {}
      } else {
        const storeUUID = localStorage.getItem("userUUID");
        if (storeUUID) {
          setUserUUID(storeUUID);
        } else {
          if (isLocalStorageAvailable()) {
            const newUUID = uuidv4();
            localStorage.setItem("userUUID", newUUID);
            setUserUUID(newUUID);
          }
        }
      }
    };
    ensureUserUUID(searchParams);
  }, [searchParams]);

  useEffect(() => {
    if (userUUID) {
      axios.defaults.headers.common["X-User-UUID"] = userUUID;
      setIsHeaderSet(true);
    }
  }, [userUUID]);

  useEffect(() => {
    if (!userUUID) {
      return;
    }
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${host_development}/question_set/1`);
        const res = response.data;
        if (
          Object.prototype.toString.call(response.data) === "[object String]"
        ) {
          setAllQuestions([
            {
              category: "D",
              ftype: "Numeric",
              name: "Q1",
              num: 1,
              set_id: 1,
              text: "blank question",
              valid: '["Yes","No"]',
            },
          ]);
          console.error(
            "Error fetching questions, got string instead of Array"
          );
        }
        const data = res.filter((_, index) => index !== 9);
        setAllQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, [userUUID, host_development]);

  useEffect(() => {
    let pageCount = Math.ceil(allQuestions.length / questionsPerPage);
    setTotalPages(pageCount);
  }, [allQuestions]);

  useEffect(() => {
    const fetchAnswers = async () => {
      if (!userUUID) {
        return;
      } else {
        const response = await axios.get(
          `${host_development}/get_answers/1/${userUUID}`
        );
        const data = response.data;
        const answersDict = data.reduce((acc, item) => {
          acc[item.question_id] = item;
          return acc;
        }, {});
        setAnswers(answersDict);
        try {
          const response_evidence = await axios.get(
            `${host_development}/get_answers_evidence/1`
          );
          if (
            !response_evidence.data ||
            Object.keys(response_evidence.data).length === 0
          ) {
            // No data returned
            setIsDataLoaded(true);
          } else {
            // Data returned
            if (Array.isArray(response_evidence.data)) {
              setTextResponses(response_evidence.data);
            } else {
              console.error(
                "response_evidence.data is not an array",
                response_evidence.data
              );
            }
          }
        } catch (error) {
          console.error("Error fetching evidence data:", error);
        }
      }
    };
    fetchAnswers();
  }, [host_development, userUUID]);

  useEffect(() => {
    const nonZeroCount = Object.values(answers).reduce((count, item) => {
      if (item.category!=='D') {
        
        return item.answer_id !== 0 ? count + 1 : count;
      }else{
        return count
      }
    }, 0);
    setAnsweredCount(nonZeroCount);
    if (nonZeroCount > 1) {
      setIsDataLoaded(true);
    }
  }, [answers]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <main className="App">
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route
          path="/fork"
          element={<Fork host_development={host_development} />}
        />
        <Route
          path="/admin"
          element={
            <PasswordProtectedRoute
              element={AdminPage}
              host_development={host_development}
              onPasswordSubmit={handlePasswordSubmit}
            />
          }
        />
        <Route
          path="/survey"
          element={
            <SurveyQuestions
              id="survey-questions"
              set_id={set_id}
              answers={answers}
              setAnswers={setAnswers}
              answeredCount={answeredCount}
              allQuestions={allQuestions}
              textResponses={textResponses}
              setTextResponses={setTextResponses}
              currentQuestions={currentQuestions}
              setCurrentQuestions={setCurrentQuestions}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              userUUID={userUUID}
              host_development={host_development}
              questionsPerPage={questionsPerPage}
            />
          }
        />
        <Route
          path="/results"
          element={
            <Results
              id="results"
              allQuestions={allQuestions}
              answers={answers}
              textResponses={textResponses}
              currentPage={currentPage}
              totalPages={totalPages}
              questions={allQuestions}
              userUUID={userUUID}
              host_development={host_development}
              isHeaderSet={isHeaderSet}
            />
          }
        />
        <Route
          path="/report/:report_uuid"
          element={
            <ResultsWrapper
              id="results"
              allQuestions={allQuestions}
              answers={answers}
              textResponses={textResponses}
              currentPage={currentPage}
              totalPages={totalPages}
              questions={allQuestions}
              host_development={host_development}
              isHeaderSet={isHeaderSet}
            />
          }
        />
      </Routes>
    </main>
  );
}

export default App;
