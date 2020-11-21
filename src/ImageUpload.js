import React, { useState } from "react";
import { Upload, Button, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import { db, storage, firestore } from "./firebase";

function ImageUpload({ user }) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  const handleUpload = () => {
    setUploading(true);

    const image = fileList[0];
    const imageName = `${nanoid()}.${image.name.split(".").pop()}`; 
    const uploadTask = storage
      .ref(`images/${imageName}`)
      .put(image);

    uploadTask.on(
      "stage_changed",
      null,
      (error) => alert(error.code),
      () => {
        storage
          .ref('images')
          .child(`${imageName}`)
          .getDownloadURL()
          .then(function (downloadURL) {
            db.collection('posts').add({
              timestamp: firestore.FieldValue.serverTimestamp(),
              imageUrl: downloadURL,
              caption: caption,
              userId: user.uid,
              username: user.displayName,
            });
          });
        setUploading(false);
        setFileList([]);
        setCaption('');
      }
    );
  };

  const onRemove = (file) => {
    const index = fileList.indexOf(file);
    setFileList([...fileList].splice(index, 1));
  };

  const beforeUpload = (file) => {
    setFileList([...fileList, file]);
    return false;
  };

  return (
    <>
      <Input
        placeholder="Type your caption here ..."
        onChange={(e) => setCaption(e.target.value)}
        value={caption}
      />

      <Upload
        fileList={fileList}
        onRemove={onRemove}
        beforeUpload={beforeUpload}
      >
        <Button disabled={fileList.length >= 1} icon={<UploadOutlined />}>
          Select File
        </Button>
      </Upload>

      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button>
    </>
  );
}

export default ImageUpload;
