import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Неподдерживаемый формат. Используйте MP4, MOV, AVI или WebM';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Размер файла превышает 500 МБ';
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setUploadComplete(false);

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoPreview(url);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          toast.success('Видео успешно загружено!');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleUpload = () => {
    if (!file) return;
    simulateUpload();
  };

  const handleReset = () => {
    setFile(null);
    setVideoPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Загрузка видео
          </h1>
          <p className="text-lg text-muted-foreground">
            Перетащите файл или выберите с устройства
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300
                ${isDragging 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-6">
                <div className={`
                  p-6 rounded-full bg-primary/10 transition-transform duration-300
                  ${isDragging ? 'scale-110' : 'scale-100'}
                `}>
                  <Icon name="Upload" size={48} className="text-primary" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Перетащите видео сюда
                  </h3>
                  <p className="text-muted-foreground">
                    или нажмите кнопку ниже
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="px-8 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Icon name="FolderOpen" size={20} className="mr-2" />
                  Выбрать файл
                </Button>

                <p className="text-sm text-muted-foreground mt-4">
                  MP4, MOV, AVI, WebM • Макс. 500 МБ
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-scale-in">
              {videoPreview && (
                <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="Film" size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} МБ
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>

                {isUploading && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Загрузка...</span>
                      <span className="font-medium text-primary">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {uploadComplete && (
                  <Alert className="border-green-200 bg-green-50 animate-scale-in">
                    <Icon name="CheckCircle2" size={20} className="text-green-600" />
                    <AlertDescription className="text-green-800 ml-2">
                      Видео успешно загружено и готово к использованию!
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="animate-scale-in">
                    <Icon name="AlertCircle" size={20} />
                    <AlertDescription className="ml-2">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  {!uploadComplete && !isUploading && (
                    <Button
                      onClick={handleUpload}
                      size="lg"
                      className="flex-1 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Icon name="CloudUpload" size={20} className="mr-2" />
                      Загрузить
                    </Button>
                  )}
                  
                  {uploadComplete && (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                      className="flex-1 py-6 text-lg font-medium rounded-xl"
                    >
                      <Icon name="RotateCcw" size={20} className="mr-2" />
                      Загрузить ещё
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
