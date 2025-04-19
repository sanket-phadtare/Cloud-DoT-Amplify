import { useState } from 'react';
import { uploadData, getUrl, list } from '@aws-amplify/storage';
import { withAuthenticator, Button } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      await uploadData({
        key: file.name,
        data: file,
        options: {
          progressCallback: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          },
        }
      }).result;
      alert('File uploaded successfully!');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Fetch list of uploaded files
  const fetchFiles = async () => {
    try {
      const { items } = await list({
        prefix: ''
      });
      setFileList(items);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Handle file download
  const handleDownload = async (key) => {
    try {
      const url = await getUrl({
        key,
        options: {
          validateObjectExistence: true
        }
      });
      window.open(url.url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut();
      // Optional: Add redirect logic here if needed
      window.location.reload();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
        <Button variation="primary" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
      
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