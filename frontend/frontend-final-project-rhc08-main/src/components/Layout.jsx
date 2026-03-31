import React from 'react'
import Sidebar from './Sidebar'
import ProofPanel from './ProofPanel'

export default function Layout({ children }) {
  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <ProofPanel />
    </div>
  )
}
