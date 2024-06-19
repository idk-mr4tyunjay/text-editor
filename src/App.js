import React from "react";
import TextEditor from "./component/TextEditor";

function App() {
  return (
    <div className="App text-center">
      <header className="App-header bg-dark text-white py-3">
        <h1>Text Editor</h1>
      </header>{" "}
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 w-100">
            <TextEditor />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
