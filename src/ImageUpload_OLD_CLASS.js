import React from "react";
import { Upload, Button, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import { db, storage } from "./firebase";

class ImageUpload extends React.Component {
  state = {
    fileList: [],
    uploading: false,
    caption: "",
  };

  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });

    this.setState({
      uploading: true,
    });

    const image = fileList[0];
    const imageName = nanoid(); //a unique name for the image
    const imageNameExt = image.name.split(".").pop();
    const uploadTask = storage
      .ref(`images/${imageName}.${imageNameExt}`)
      .put(image);

    uploadTask.on(
      "stage_changed",
      null,
      (error) => alert(error.code),
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          db.collection('posts').add({
            timestamp: "firestore.FieldValue.serverTimestamp()",
            imageUrl: downloadURL,
            caption: "this.state.caption",
            userId: "props.user.id",
          })
        });
      }
    );
  };

  render() {
    const { uploading, fileList } = this.state;
    const props = {
      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState((state) => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <>
        <Input 
          placeholder="Type your caption here ..."
          onChange={(event)=>{
            this.setState((prevStage) => ({...prevStage, caption: event.target.value}));
          }}
          value={this.state.caption}
        />
        <Upload {...props}>
          <Button disabled={fileList.length === 1} icon={<UploadOutlined />}>
            Select File
          </Button>
        </Upload>
        <Button
          type="primary"
          onClick={this.handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? "Uploading" : "Start Upload"}
        </Button>
      </>
    );
  }
}

export default ImageUpload;
