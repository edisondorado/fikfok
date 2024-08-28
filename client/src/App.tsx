import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Home'
import NavBar from './pages/NavBar'
import Video from './pages/Video'
import Profile from './Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/p/:username/videos" element={<Video type="profile"/>} />
      <Route path="/video/:videoId" element={<Video type="video" />}/>
      <Route path="/p/:username" element={<Profile />} />
    </Routes>
  )
}

export default App