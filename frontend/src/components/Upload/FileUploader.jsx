import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, File, FileArchive, Sparkles } from 'lucide-react';
import { uploadDocument } from '../../services/api';
import UploadProgress from './UploadProgress';

const FileUploader = ({ onUploadComplete, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  // አዲስ State ጨምር
  const [selectedFile, setSelectedFile] = useState(null);

 
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="h-10 w-10 text-red-500" />;
      case 'docx': return <File className="h-10 w-10 text-blue-500" />;
      default: return <FileArchive className="h-10 w-10 text-gray-500 dark:text-gray-400" />;
    }
  };

  // const onDrop = useCallback(async (acceptedFiles) => {
  //   const file = acceptedFiles[0];
  //   if (!file) return;
    const onDrop = useCallback(async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
    
    setSelectedFile(file);
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Only PDF, DOCX, and TXT files are supported');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await uploadDocument(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      setUploadedFile(result);
      onUploadComplete?.(result);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className={className}>
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          {isDragActive ? (
            <p className="text-primary-600 dark:text-primary-400 font-medium">Drop the file here...</p>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Drag & drop a file here, or click to select</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Supports PDF, DOCX, TXT (Max 50MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getFileIcon(uploadedFile.original_filename)}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{uploadedFile.original_filename}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {(uploadedFile.file_size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.word_count?.toLocaleString()} words
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {uploading && <UploadProgress progress={progress} />}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-3 animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
        </div>
      )}

      {uploadedFile && !uploading && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-3 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 text-sm font-medium">Document uploaded successfully!</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;