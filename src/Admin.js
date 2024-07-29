import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPage = ({ host_development }) => {
  const [rowCount, setRowCount] = useState({});
  const [error, setError] = useState("");

  const downloadCSV = async () => {
    try {
      const response = await axios.get(`${host_development}/export-csv`, {
        responseType: "blob",
        headers: {
          Accept: "text/csv",
        },
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError("Error downloading CSV. Please try again later.");
    }
  };

  const getRowCount = async () => {
    try {
      const response = await axios.get(`${host_development}/count-rows`);
      setRowCount(response.data);
    } catch (err) {
      setError("Error fetching row count. Please try again later.");
    }
  };

  useEffect(() => {
    getRowCount();
  }, []);

  return (
    <div>
      <h2>Admin Page</h2>
      <div>
        {rowCount !== null && (
          <>
            <p>Total Survey Count: {rowCount["num_users"]}</p>
            <p>Completed Count: {rowCount["complete"]}</p>
          </>
        )}
      </div>
      <div>
        <button onClick={downloadCSV}>Download CSV</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AdminPage;
