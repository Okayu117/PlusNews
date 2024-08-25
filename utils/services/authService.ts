// services/authService.ts
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // ここでユーザーのUIDを取得
    const uid = user.uid;

    // Firestoreの`users`コレクションにUIDをドキュメントIDとして使ってデータを保存
    await setDoc(doc(db, "users", uid), {
      email: user.email,
      displayName: "新しいユーザー",
      profileImage: "",
      createdAt: new Date().toISOString(),
      favorites: []
    });

    console.log("ユーザー登録とデータ保存が完了しました。");
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
  }
};
