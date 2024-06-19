import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const TextEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleLogContent = () => {
    console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  };

  return (
    <div>
   <div >
        <Editor
          editorState={editorState}
          toolbarClassName="border border-dark-subtle d-flex justify-content-center m-0 "
          wrapperClassName=""
          editorClassName="border border-secondary p-2"
          onEditorStateChange={onEditorStateChange}
        />
   </div>
      <button onClick={handleLogContent} className="btn btn-primary mt-3">
        Log Content
      </button>
    </div>
  );
};

export default TextEditor;
