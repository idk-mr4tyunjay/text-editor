import React, { useRef, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import axios from "axios";
import "./Editor.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const TextEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const fileInputRef = useRef(null);

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    const contentState = newEditorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const entityMap = rawContent.entityMap;
    const newPendingImages = [];
    Object.keys(entityMap).forEach((key) => {
      if (entityMap[key].type === "IMAGE" && entityMap[key].data.src) {
        newPendingImages.push(entityMap[key].data.src);
      }
    });
    setPendingImages(newPendingImages);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileAdd = (newFile) => {
    const newFilesArray = Array.from(newFile);
    setAttachments((prevAttachments) => [...prevAttachments, ...newFilesArray]);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleLogContent = async () => {
    // Step 1: Upload images and get new URLs
    const uploadedImages = await Promise.all(
      pendingImages.map(async (src) => {
        const datx = {
          data: {
            type: "local",
            file: src,
            user: { user: "mruthunjay" },
            asset: "******",
          },
          srvc: "******",
        };
        const base = "https://ap-south-1.aws.data.mongodb-api.com/app/miniland-media-temscdn/endpoint/business/media/save";
        const head = { Authorization: ["******"] };
  
        try {
          console.log("Sending request with data:", datx); // Log the payload
          const res = await axios.post(base, datx, { headers: head });
          console.log("Response:", res); // Log the response
          return { originalSrc: src, newSrc: res.data.data.link || "" }; // Return both original and new URLs
        } catch (error) {
          console.error("Error uploading image:", error.response ? error.response.data : error.message);
          return { originalSrc: src, newSrc: src }; // Return original src in case of error
        }
      })
    );
  
    // Step 2: Update image URLs in the editor state
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const entityMap = rawContent.entityMap;
  
    Object.keys(entityMap).forEach((key) => {
      if (entityMap[key].type === "IMAGE") {
        const image = uploadedImages.find((img) => img.originalSrc === entityMap[key].data.src);
        if (image) {
          entityMap[key].data.src = image.newSrc;
        }
      }
    });
  
    const updatedRawContent = { ...rawContent, entityMap };
    const updatedContentState = convertFromRaw(updatedRawContent);
    const newEditorStateWithUpdates = EditorState.push(
      editorState,
      updatedContentState,
      "apply-entity"
    );
    setEditorState(newEditorStateWithUpdates);
  
    // Step 3: Convert updated editor content to HTML
    const htmlString = draftToHtml(convertToRaw(newEditorStateWithUpdates.getCurrentContent()));
  
    // Step 4: Handle file attachments and email sending
    const fileBase64Array = await Promise.all(
      attachments.map(file => fileToBase64(file).then(base64 => ({
        name: file.name,
        base64
      })))
    );
  
    const dataX = {
      data: {
        user: {
          name: "mruthujay",
          mail: recipient,
        },
        subject,
        content: htmlString,
        file: fileBase64Array,
      },
    };
    console.log(dataX);
    const url = "https://ap-south-1.aws.data.mongodb-api.com/app/bharat-alerts-nebadui/endpoint/test/alert/dynamic/content";
    const result = await axios.post(url, dataX);
    console.log(result.data);
  };
  

  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ data: { link: reader.result } });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const toolbarOptions = {
    options: [
      "inline",
      "fontSize",
      "list",
      "textAlign",
      "emoji",
      "link",
      "image",
      "history",
    ],
    inline: {
      options: ["bold", "italic", "underline", "strikethrough", "monospace"],
    },
    blockType: {
      inDropdown: true,
    },
    fontSize: {
      options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36],
    },
    list: {
      inDropdown: false,
      options: ["unordered", "ordered", "indent", "outdent"],
    },
    textAlign: {
      inDropdown: false,
      options: ["left", "center", "right", "justify"],
    },
    emoji: {},
    link: {
      defaultTargetOption: "_blank",
    },
    image: {
      uploadCallback: uploadImageCallBack,
      previewImage: true,
      alignmentEnabled: true,
      alt: { present: true, mandatory: false },
      defaultSize: {
        height: "auto",
        width: "auto",
      },
    },
    history: {
      inDropdown: false,
      options: ["undo", "redo"],
    },
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Recipient"
        className="form-control mb-2"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        placeholder="Subject:"
        className="form-control mb-2"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <Editor
        editorState={editorState}
        toolbarClassName="border border-dark-subtle d-flex justify-content-center m-0"
        editorClassName="border border-secondary p-2 editor"
        onEditorStateChange={onEditorStateChange}
        toolbar={toolbarOptions}
        spellCheck={true}
        autoCapitalize="on"
        stripPastedStyles={true}
      />
      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={handleButtonClick}
        >
          Choose Attachment file
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          multiple
          onChange={(e) => handleFileAdd(e.target.files)}
        />
        <button onClick={handleLogContent} className="btn btn-primary">
          Send Email
        </button>
      </div>
      <div className="mt-2" style={{ width: "10vw" }}>
        {attachments.map((item, i) => (
          <p key={i} className="d-flex justify-content-between">
            {item.name}
            <span
              style={{ color: "red", cursor: "pointer" }}
              onClick={() =>
                setAttachments(attachments.filter((_, index) => index !== i))
              }
            >
              X
            </span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default TextEditor;
