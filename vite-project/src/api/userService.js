import axios from './axiosInstance';

const API_URL = 'https://697e36ac97386252a26a2c01.mockapi.io/kullanici';
const SETTINGS_API_URL = 'https://6a3bc0d3e4a07f202e15c956.mockapi.io/settings';
const DEPARTMENTS_API_URL = 'https://6a3bc0d3e4a07f202e15c956.mockapi.io/departments';

export const fetchUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data.map((user) => ({
    id: user.id,
    name: user.isim,
    surname: user.soyisim,
    phone: user.telefon,
    description: user.aciklama,
    email: user.email,
    isActive: user.isActive,
    username: user.username,
    password: user.password,
  }));
};

export const deleteUserById = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

export const createNewUser = async (payload) => {
  return await axios.post(API_URL, payload);
};

export const updateExistingUser = async (id, payload) => {
  return await axios.put(`${API_URL}/${id}`, payload);
};

/*}
export const loginUserApi = async(credentials) => {
  const response = await axios.post(`${API_URL}/login`,credentials);
  return response.data;

};

*/
export const fetchUserById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  const user = response.data;
  return {
    id: user.id,
    name: user.isim,
    surname: user.soyisim,
    phone: user.telefon,
    description: user.aciklama,
    email: user.email,
    isActive: user.isActive,
    username: user.username,
    password: user.password,
  };
};

export const fetchUserSettings = async (userId) => {
  try {
    const response = await axios.get(SETTINGS_API_URL);
    const settingsList = response.data;
    const userSettings = settingsList.find(
      (s) => String(s.userId) === String(userId) || String(s.id) === String(userId)
    );

    if (userSettings) {
      return {
        id: userSettings.id,
        userId: userSettings.userId || userId,
        darkMode: Boolean(userSettings.darkMode),
        twoFASms: Boolean(userSettings.twoFASms),
        twoFAEmail: Boolean(userSettings.twoFAEmail),
        twoFAAuth: Boolean(userSettings.twoFAAuth),
        sessionTimeout: userSettings.sessionTimeout || 15,
        emailNot: Boolean(userSettings.emailNot),
        pushNot: Boolean(userSettings.pushNot),
        DND: userSettings.DND === 4 ? '4h' : userSettings.DND || 'off',
        defaultPage: userSettings.defaultPage || 'Dashboard',
        timeZone: userSettings.timeZone || 'UTC',
        dateFormat: userSettings.dateFormat || 'DD/MM/YYYY',
        soundEffects: Boolean(userSettings.soundEffects),
      };
    }
  } catch (error) {
    console.error('Error fetching user settings:', error);
  }

  return {
    userId: userId,
    darkMode: false,
    twoFASms: false,
    twoFAEmail: false,
    twoFAAuth: false,
    sessionTimeout: 15,
    emailNot: false,
    pushNot: false,
    DND: 'off',
    defaultPage: 'Dashboard',
    timeZone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    soundEffects: false,
  };
};

export const updateUserSettings = async (userId, payload) => {
  const response = await axios.get(SETTINGS_API_URL);
  const settingsList = response.data;
  const existingSettings = settingsList.find(
    (s) => String(s.userId) === String(userId) || String(s.id) === String(userId)
  );

  if (existingSettings) {
    return await axios.put(`${SETTINGS_API_URL}/${existingSettings.id}`, payload);
  } else {
    return await axios.post(SETTINGS_API_URL, { ...payload, userId });
  }
};

export const fetchDepartments = async () => {
  const response = await axios.get(DEPARTMENTS_API_URL);
  return response.data.map((dept) => ({
    id: dept.id,
    department_name: dept.department_name,
    staff: Array.isArray(dept.staff) ? dept.staff : [],
  }));
};

export const fetchDepartmentById = async (id) => {
  const response = await axios.get(`${DEPARTMENTS_API_URL}/${id}`);
  const dept = response.data;
  return {
    id: dept.id,
    department_name: dept.department_name,
    staff: Array.isArray(dept.staff) ? dept.staff : [],
  };
};

export const createDepartment = async (payload) => {
  return await axios.post(DEPARTMENTS_API_URL, payload);
};

export const updateDepartment = async (id, payload) => {
  return await axios.put(`${DEPARTMENTS_API_URL}/${id}`, payload);
};

export const deleteDepartment = async (id) => {
  return await axios.delete(`${DEPARTMENTS_API_URL}/${id}`);
};
