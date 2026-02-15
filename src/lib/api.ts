import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getAllRecords = async (date?: string) => {
    let url = '/attendance/all';
    if (date) {
        url += `?date=${date}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const deleteAttendance = async (id: number) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
};

// Re-using upsert for admin updates, but explicit naming helps clarity
export const updateAttendance = async (data: any) => {
    const response = await api.post('/attendance', data);
    return response.data;
};

export const downloadExcel = async () => {
    try {
        const response = await api.get('/attendance/export', {
            responseType: 'blob',
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'presenze.xlsx');

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
    } catch (error) {
        console.error('Failed to download Excel', error);
        throw error;
    }
};

export const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/users/upload-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export default api;
