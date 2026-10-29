import type { AxiosInstance } from "axios";
import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {                               // This defines the structure of a user object in TS.
    id: string;
    name: string;
    email: string;
    plan: string;
    analysisCount?: number;                 // ? means optional
}

interface AppContextType {                  // This interface defines everything the context will provide to other components.
    user: User | null;                      // initially, no user may be logged in.
    token: string | null;
    loading: boolean;
    api: AxiosInstance;                     // Axios instance for backend requests
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";           // Frontend send req here

// Initially, its value is undefined. Later, AppProvider supplies the actual value.
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);        // <type> the interface we created above
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Axios instance with auth header
    const api = axios.create({               // axios is the original library, while api is your configured instance.
        baseURL: BACKEND_URL,
    });

    // Update axios headers when token changes
    api.interceptors.request.use((config) => {                 // config lets you modify the request before it is sent to the backend.
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const loadUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get("/api/auth/user");
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();                            // Will run the loadUser automatically one time(due to empty arr) on the initial mount. 
    }, []);

    const login = async (email: string, password: string) => {           // sends login cred to backend
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
            if (res.data.success) {
                setToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("token", res.data.token);
                return { success: true };
            }
            return { success: false, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/register`, { name, email, password });
            if (res.data.success) {
                setToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("token", res.data.token);
                return { success: true };
            }
            return { success: false, message: res.data.message };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const logout = async () => {               // This clears the frontend's authentication state.
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };                                         // This function does not make a backend request. It performs a client-side logout.

    const value = { user, token, loading, api, login, register, logout };

    return <AppContext.Provider value={value}> {children} </AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
}
// useApp() lets any component access the shared data and functions from AppContext without passing them through props.






{/*
    This file manages authentication and shares user information across your React frontend.
        The main idea is: You log in once, store the token, and use it for subsequent protected API requests.

    useEffect: Runs code when a component mounts or dependencies change.
    ReactNode: Type representing React content, such as components and JSX.

    Why use Context? So components like Navbar, Login, and Dashboard can access user information without passing props through every component.

    Ln30: Reads the existing JWT from localStorage when the provider initializes. This helps maintain authentication when the user refreshes the page.

    Ln39Fn.:  An Axios request interceptor runs before a request is sent.
    Flow:
        Step 1: A component makes a request
        Step 2: The interceptor runs before sending it. It retrieves the saved JWT token.
        Step 3: If a token exists, it adds the authorization header.
        Step 4: The request is sent to the backend.
    
    Why is this useful?
        Without an interceptor, you would need to manually attach the token to every protected request.
        With the interceptor, it happens automatically for requests made through api.
    
    Ln48Fn.: Working:
        Check the token: If no token exists, stop loading and return.
        Send the request: Call /api/auth/user.
        Attach the token: The Axios interceptor adds the authorization header.
        Update the user: If the request succeeds, store the returned user in state.
        Handle errors: If the request fails, remove the stored token and clear the user.
        Finish loading: Set loading to false.

        Example: Refreshing the page
        Suppose you logged in yesterday and the token is still stored in localStorage. When you reopen or refresh the application: You can restore the user's session without asking them to log in again, provided the token remains valid.

    loadUser flow:

        App starts
            ↓
        Read token from localStorage
            ↓
        Call loadUser()
            ↓
        GET /api/auth/user
            ↓
        Interceptor attaches JWT
            ↓
        Backend verifies JWT
            ↓
        User details returned
            ↓
        setUser(data.user)


    Successful Login Flow:

    User enters email and password
                ↓
    Frontend calls POST /api/auth/login
                ↓
    Backend verifies credentials
                ↓
    Backend returns JWT + user details
                ↓
    Frontend stores JWT in localStorage
                ↓
    setToken() updates React state
                ↓
    setUser() updates React state
                ↓
    Login succeeds
*/}