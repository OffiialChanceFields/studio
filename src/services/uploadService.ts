const UPLOAD_SESSION_URI_KEY = 'uploadSessionUri';

export const saveUploadSessionUri = (uri: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(UPLOAD_SESSION_URI_KEY, uri);
  }
};

export const getUploadSessionUri = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(UPLOAD_SESSION_URI_KEY);
  }
  return null;
};

export const clearUploadSessionUri = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(UPLOAD_SESSION_URI_KEY);
    }
};