import { useState } from 'react';
import { uploadData, getUrl, list } from '@aws-amplify/storage';
import { withAuthenticator, Button, Flex, Card, Heading, Text, Alert, Loader } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      await uploadData({
        key: `${Date.now()}-${file.name}`,
        data: file,
        options: {
          progressCallback: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          },
        }
      }).result;
      setSuccess('File uploaded successfully!');
      fetchFiles();
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const { items } = await list({ prefix: '' });
      setFileList(items);
    } catch (err) {
      setError('Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (key) => {
    try {
      const url = await getUrl({ key });
      window.open(url.url, '_blank');
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      setError('Logout failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Flex direction="column" padding="20px" style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom="30px">
  <Flex alignItems="center" gap="10px">
    <img src="/dot.jpg" alt="Logo" style={{ height: '150px' }} />
    <Heading level={2} style={{ color: '#333', margin: 0 }}>
      Cloud-DoT-Storage-Lab7
    </Heading>
  </Flex>
  <Button variation="primary" onClick={handleLogout}>
    Sign Out
  </Button>
</Flex>
      

      {/* Main Content */}
      <Flex direction="column" gap="20px" flex={1}>
        {/* Upload Card */}
        <Card variation="outlined">
          <Heading level={4} marginBottom="10px">
            Upload New File
          </Heading>

          <Flex direction="column" gap="10px">
            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
            <label htmlFor="file-upload">
              <Button as="span" variation="primary">
                Choose File
              </Button>
            </label>

            {file && (
              <Text>
                Selected: <strong>{file.name}</strong> ({formatFileSize(file.size)})
              </Text>
            )}

            <Button variation="primary" onClick={handleUpload} isDisabled={!file || isLoading}>
              {isLoading ? 'Uploading...' : 'Upload File'}
            </Button>

            {uploadProgress > 0 && (
              <Flex direction="column" gap="5px">
                <Text>Upload Progress: {uploadProgress}%</Text>
                <progress value={uploadProgress} max="100" style={{ width: '100%', height: '8px' }} />
              </Flex>
            )}
          </Flex>
        </Card>

        {/* File List Card */}
        <Card variation="outlined">
          <Flex justifyContent="space-between" alignItems="center" marginBottom="10px">
            <Heading level={4}>Your Files</Heading>
            <Button variation="link" onClick={fetchFiles} isDisabled={isLoading}>
              {isLoading ? <Loader size="small" /> : 'Refresh'}
            </Button>
          </Flex>

          {error && <Alert variation="error" marginBottom="10px">{error}</Alert>}
          {success && <Alert variation="success" marginBottom="10px">{success}</Alert>}

          {fileList.length === 0 ? (
            <Text>No files uploaded yet</Text>
          ) : (
            <Flex direction="column" gap="10px">
              {fileList.map((file) => (
                <Card key={file.key} variation="elevated">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Flex direction="column">
                      <Text fontWeight="bold">{file.key.split('/').pop()}</Text>
                      <Text fontSize="small" color="#888">
                        Last modified: {new Date(file.lastModified).toLocaleString()}
                      </Text>
                    </Flex>
                    <Button size="small" onClick={() => handleDownload(file.key)}>
                      Download
                    </Button>
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </Card>
      </Flex>

      {/* Footer */}
      <Text textAlign="center" marginTop="40px" color="#aaa">
        Sanket Phadtare CI24M12 © {new Date().getFullYear()}
      </Text>
    </Flex>
  );
}

export default withAuthenticator(FileUpload, {
  loginMechanisms: ['email'],
  socialProviders: ['google', 'facebook'],
});
