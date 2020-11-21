import React, { useState, useEffect } from "react";
import Post from "./Post.js";
import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";
import ImageUpload from "./ImageUpload";
import { db, auth } from "./firebase";
import { Modal, Button } from "antd";
import instaLogoUrl from "./images/ig-logo.png";
import "./App.css";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [signupIsOpen, setSignupIsOpen] = useState(false);
  const [loginIsOpen, setLoginIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [newLikeNoti, setNewLikeNoti] = useState({});
  console.log("1;");
  useEffect(() => {
    const unsubcribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // User has logged in ...
        setUser(currentUser);
        if (user) {
          console.log(Object.keys(user));
          console.log(Object.values(user));
          console.log(user.uid);
          console.log(user);
        }
      } else {
        // User has logged out ...
        setUser(null);
      }
    });
    // perform cleanup action
    return () => {
      unsubcribe();
    };
  }, [user]);

  useEffect(() => {
    const unsubcribe = db
      .collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
    return () => unsubcribe();
  }, []);

  useEffect(() => {
    console.log("2 xxx" + user);

    let unsubcribe;
    if (user) {
      console.log("3 xxx" + user.uid);
      unsubcribe = db
        .collection("posts")
        .where("userId", "==", user.uid)
        .onSnapshot((snapshot) => {
          console.log("leng la: ", snapshot.docChanges().length);
          snapshot.docChanges().forEach(function (change) {
            // const type = change.type;
            // const userIdCmt = [...change.doc.data().likes].pop();
            // const postId = change.o_.doc.id;
            // console.log(
            //   `type: ${change.type},userid lastest cmt: ${[
            //     ...change.doc.data().likes,
            //   ].pop()}, ID bai post: ${change.o_.doc.id}`
            // );
            // if (type == "modified" && userIdCmt !== undefined) {
            //     setNewLikeNoti({ userIdCmt: userIdCmt, postId: postId });
            // }
            console.log(change.type, change.doc.data());
          });
        });
    }
    return () => {
      console.log("4 x-x-x");
    };
  }, [user]);


  // TEST NOTI FOR NEW COMMENT
  useEffect(() => {
    console.log("2 xxx COMMENT" + user);

    let unsubcribe;
    if (user) {
      console.log("3 xxx COMMENT" + user.uid);
      unsubcribe = db
        .collection('comments')
        .onSnapshot((snapshot) => {
          console.log("leng la: ", snapshot.docChanges().length);
          snapshot.docChanges().forEach(function (change) {
            // const type = change.type;
            // const userIdCmt = [...change.doc.data().likes].pop();
            // const postId = change.o_.doc.id;
            // console.log(
            //   `type: ${change.type},userid lastest cmt: ${[
            //     ...change.doc.data().likes,
            //   ].pop()}, ID bai post: ${change.o_.doc.id}`
            // );
            // if (type == "modified" && userIdCmt !== undefined) {
            //     setNewLikeNoti({ userIdCmt: userIdCmt, postId: postId });
            // }
            console.log(change.type, change.doc.data());
          });
        });
    }
    return () => {
      console.log("4 x-x-x COMMENT");
    };
  }, [user]);
  // ==========================


  const signUp = (values) => {
    auth
      .createUserWithEmailAndPassword(values.email, values.password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: values.username,
        });
      })
      .then(() => setSignupIsOpen(false))
      .catch((error) => alert(error.message));
  };

  const login = (values) => {
    auth
      .signInWithEmailAndPassword(values.email, values.password)
      .then(() => setLoginIsOpen(false))
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === "auth/wrong-password") {
          alert("Wrong password.");
        } else {
          alert(errorMessage);
        }
      });
  };

  return (
    <div className="app">
      <Modal
        visible={signupIsOpen}
        footer={null}
        onCancel={() => setSignupIsOpen(false)}
      >
        <center>
          <img className="app__headerImg" src={instaLogoUrl} alt="" />
        </center>
        <SignUpForm handleSignup={signUp} />
      </Modal>

      <Modal
        visible={loginIsOpen}
        footer={null}
        onCancel={() => setLoginIsOpen(false)}
      >
        <center>
          <img className="app__headerImg" src={instaLogoUrl} alt="" />
        </center>
        <LoginForm handleLogin={login} />
      </Modal>

      {/* Header */}
      <div className="app__header">
        <img className="app__headerImg" src={instaLogoUrl} alt="" />
      </div>
      {!user && (
        <>
          <Button type="primary" onClick={() => setSignupIsOpen(true)}>
            Sign up
          </Button>
          <Button type="default" onClick={() => setLoginIsOpen(true)}>
            Log in
          </Button>
        </>
      )}

      {user && (
        <Button
          type="danger"
          onClick={() => {
            auth.signOut();
          }}
        >
          Log out
        </Button>
      )}

      <h1>
        {user?.displayName ? `Hello ${user.displayName}` : "người lạ ơi!"}
        <p>
          "Thong bao moi: co 1 like moi tu user id" {newLikeNoti.userIdCmt} "da
          thich tai viet cua ban co id la " {newLikeNoti.postId}
        </p>
      </h1>

      {user?.displayName ? (
        <ImageUpload user={user} />
      ) : (
        `người lạ ơi!, login để upload nhé.`
      )}

      {posts.map(({ post, id }) => (
        <Post
          key={id}
          postId={id}
          currentUser={user}
          postUserName={post.username}
          caption={post.caption}
          imageUrl={post.imageUrl}
        />
      ))}
    </div>
  );
}
