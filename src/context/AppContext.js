// @shared context/AppContext.js — Firebase Auth version
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../core/firebase';

const SESSION_KEY = '@movie/session_user';

const initialState = {
  user:       null,
  isLoggedIn: false,
  isLoading:  true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoggedIn: true, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Lắng nghe Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load profile từ Firestore
        let profile = {};
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) profile = snap.data();
        } catch (e) {
          console.warn('[AppContext] Không load được profile:', e.message);
        }

        const user = {
          uid:      firebaseUser.uid,
          id:       firebaseUser.uid,   // backward compat
          email:    firebaseUser.email,
          fullName: profile.fullName || firebaseUser.email.split('@')[0],
        };

        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
        dispatch({ type: 'LOGIN', payload: user });
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => unsubscribe(); // cleanup khi unmount
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

// Action helpers
export const loginAction  = (user) => ({ type: 'LOGIN',  payload: user });
export const logoutAction = ()     => ({ type: 'LOGOUT' });
