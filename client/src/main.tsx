import React, { createContext } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react'
import toast, { Toaster } from 'react-hot-toast';

import Store from './store/store';
import "./index.css"

import NavBar from './pages/NavBar.tsx'
import Theme from './Theme.tsx';
import App from './App.tsx';

interface StateStore {
  store: Store,
}

const store = new Store();

export const Context = createContext<StateStore>({
  store,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <NextUIProvider>
    <Context.Provider value={{ store }}>
      <Theme>
        <NavBar />
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              color: "#000000",
              background: "#F5F5F5"  
            },
            success: {
              iconTheme: {
                primary: "#000000",
                secondary: "#F5F5F5"
              }
            },
            error: {
              iconTheme: {
                primary: "#000000",
                secondary: "#F5F5F5"
              }
            },
            loading: {
              iconTheme: {
                primary: "#000000",
                secondary: "#F5F5F5"
              }
            }
          }}
        />
        <Router>
          <App />
        </Router>
      </Theme>
    </Context.Provider>
  </NextUIProvider>,
)