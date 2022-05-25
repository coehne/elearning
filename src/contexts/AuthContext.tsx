import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as auth from "../AuthProvider";
import { User } from "../models/User";
import FullPageSpinner from "../components/FullPageSpinner";
import FullPageErrorFallback from "../components/FullPageErrorFallback";
import { useAsync } from "../hooks/useAsync";
import axios from "axios";
import { config } from "../utils/config";

// TODO: Add session to auth context

interface AuthContextType {
  user: User | null;
  login: (form: auth.LoginRegisterForm) => Promise<any>;
  register: (form: auth.LoginRegisterForm) => Promise<any>;
  logout: () => void;
  authTokens: auth.AuthTokens | null;
  setAuthTokens: (authTokens: auth.AuthTokens | null) => void;
}

export let AuthContext = createContext<AuthContextType>(null!);

const AuthProvider = (props: { children: ReactNode }) => {
  const [authTokens, setAuthTokens] = useState<auth.AuthTokens | null>(() =>
    auth.getTokens()
  );
  const {
    state: { data: user },
    status,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
  } = useAsync<User>();

  const bootstrapAppData = async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let user: User = null!;

    // Get authTokens from local storage
    let authTokens = await auth.getTokens();

    if (authTokens && authTokens.accessToken.length > 2) {
      if (auth.isTokenExpired(authTokens.accessToken)) {
        const newTokens = await auth.refreshTokens(authTokens.refreshToken);
        if (newTokens) {
          authTokens = newTokens;
        }
      }
      setAuthTokens(authTokens);

      const data = await axios.get("/identity/me", {
        baseURL: config.apiBaseUrl,
        headers: { Authorization: `Bearer ${authTokens.accessToken}` },
      });
      user = data.data;
    }
    return user;
  };

  // Get user data when initialize
  useEffect(() => {
    const appDataPromise = bootstrapAppData();
    run(appDataPromise);
  }, [run]);

  const login = useCallback(
    (form: auth.LoginRegisterForm) =>
      // login user (create session)
      auth.login(form).then(() => {
        const appDataPromise = bootstrapAppData();
        run(appDataPromise);
      }),
    [setData]
  );
  const register = useCallback(
    (form: auth.LoginRegisterForm) =>
      auth.register(form).then((user) => setData(user)),
    [setData]
  );

  const logout = useCallback(() => {
    auth.logout();
    setData(null!);
  }, [setData]);

  const value = useMemo(
    () => ({ user, login, logout, register, authTokens, setAuthTokens }),
    [register, login, logout, user, authTokens]
  );
  if (isLoading || isIdle) {
    return <FullPageSpinner />;
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />;
  }

  if (isSuccess) {
    return <AuthContext.Provider value={value} {...props} />;
  }

  throw new Error(`Unhandled status: ${status}`);
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within a AuthProvider`);
  }
  return context;
};

export { AuthProvider, useAuth };
