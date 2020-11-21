import React, { useState, useEffect } from "react";
import { Avatar, Form, Input, Button } from "antd";
import { db, firestore, timestamp } from "./firebase";
import { HeartOutlined, HeartTwoTone } from "@ant-design/icons";

import "./Post.css";

const Post = ({ currentUser, postId, postUserName, caption, imageUrl }) => {
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [isLike, setIsLike] = useState(true);
  const [form] = Form.useForm();
  
  useEffect(() => {
    let unsubcribe;
    if (postId) {
      unsubcribe = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy('timestamp')
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });
    }
    return () => {
      unsubcribe();
    };
  }, [postId]);

  useEffect(() => {
    const unsubcribe = db
      .collection("posts")
      .doc(postId)
      .onSnapshot((snapshot) => {
        if (snapshot.data().likes) {
          const likes = snapshot.data().likes;
          setLikes(likes);
          if (currentUser) setIsLike(likes.indexOf(currentUser.uid) === -1);
        } else {
          setLikes(0);
          setIsLike(false);
        }
      });
      return () => {
        unsubcribe();
      };
  }, [currentUser, postId]);

  const handleLike = () => {
    db.collection("posts")
      .doc(postId)
      .update({
        likes: firestore.FieldValue.arrayUnion(currentUser.uid),
    })
  };

  const handleUnLike = () => {
    db.collection("posts")
      .doc(postId)
      .update({
        likes: firestore.FieldValue.arrayRemove(currentUser.uid),
    })
  };

  const postComment = (values) => {
    db.collection("posts").doc(postId).collection("comments").add({
      text: values.text,
      username: currentUser.displayName,
      userId: currentUser.uid,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    form.resetFields();
  };

  return (
    <div className="post">
      <div className="post__header">
        <Avatar
          className="post__avatar"
          src="https://loremflickr.com/320/320/"
          alt="longpos"
        ></Avatar>
        <h3>{postUserName}</h3>
      </div>

      <img className="post__image" src={imageUrl} alt="" />

      <div className="post__like">
        {isLike && (
          <HeartOutlined
            style={{ filter: "opacity(15%)", fontSize: "x-large" }}
            onClick={currentUser ? handleLike : null}
          />
        )}
        {!isLike && (
          <HeartTwoTone
            twoToneColor="#FF0000"
            style={{ fontSize: "x-large" }}
            onClick={currentUser ? handleUnLike : null}
          />
        )}
        <span>
          {likes.length || 0} {likes.length > 1 ? "likes" : "like"}
        </span>
      </div>

      <h4 className="post__text">
        <strong>{postUserName}</strong> {caption}
      </h4>

      <div className="post__comments">
        {comments.map((comment, id) => (
          <p key={id}>
            <strong>{comment.username} </strong>
            {comment.text}
          </p>
        ))}
      </div>

      {currentUser && (
        <Form form={form} name="control-hooks" onFinish={postComment}>
          <Form.Item name="text">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit">Post</Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Post;
