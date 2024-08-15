import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const ImageUpload = ({ id }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    const storage = getStorage();//Firebase Storageのインスタンスを取得
    const storageRef = ref(storage, `profileImages/${id}`);

    await uploadBytes(storageRef, image);//選択された画像をFirebase Storageにアップロード
    const url = await getDownloadURL(storageRef);//アップロードした画像のURLを取得

    setImageUrl(url);

    const db = getFirestore();
    const userRef = doc(db, "users", id);

    await updateDoc(userRef, {
      profileImage: url
    });
  };

    return (
      <>
        <input type="file" onChange={handleImageChange} />
        <button onClick={handleUpload}>画像をアップロード</button>
        {imageUrl && <img src={imageUrl} alt="userimage" />}
      </>
    );
};

export default ImageUpload;
