import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import HomePage from './pages/HomePage'
import AgentCreatePage from './pages/AgentCreatePage'
import AgentDetailPage from './pages/AgentDetailPage'
import AgentListPage from './pages/AgentListPage'
import AgentEditPage from './pages/AgentEditPage'
import AgentSandboxPage from './pages/AgentSandboxPage'
import TemplatesPage from './pages/TemplatesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'

export default function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agents" element={<AgentListPage />} />
        <Route path="/agents/new" element={<AgentCreatePage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/agents/:id/edit" element={<AgentEditPage />} />
        <Route path="/agents/:id/sandbox" element={<AgentSandboxPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </PageLayout>
  )
}
