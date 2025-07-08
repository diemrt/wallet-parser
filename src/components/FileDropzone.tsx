import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileDropzoneProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileUpload, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Elaborazione in corso...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-700">
              {isDragActive ? 'Rilascia il file qui' : 'Carica il tuo file CSV'}
            </h3>
            <p className="text-gray-500">
              Trascina e rilascia un file CSV oppure clicca per selezionarlo
            </p>
            <p className="text-sm text-gray-400">
              Formato supportato: .csv
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;
