import { toast } from 'react-toastify';

// The service is now very simple. It just triggers the toast type.
const showSuccessToast = (message) => {
  toast.success(message);
};

const showErrorToast = (message) => {
  toast.error(message);
};

const showInfoToast = (message) => {
  toast.info(message);
};

const toastService = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
};

export default toastService;