import { useState } from 'react';
import { Storage } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      await Storage.put(file.name, file, {
        progressCallback: (progress) => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });
      alert('File uploaded successfully!');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const files = await Storage.list('');
      setFileList(files.results);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDownload = async (key) => {
    try {
      const url = await Storage.get(key);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div>
      <h2>File Upload</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
      
      <h3>Your Files</h3>
      <button onClick={fetchFiles}>Refresh Files</button>
      <ul>
        {fileList.map((file, index) => (
          <li key={index}>
            {file.key} 
            <button onClick={() => handleDownload(file.key)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withAuthenticator(FileUpload);