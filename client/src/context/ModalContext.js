import React, { createContext, useContext, useState, useCallback } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null)

  const showConfirm = useCallback(({ title, message, confirmLabel, cancelLabel }) => {
    return new Promise((resolve) => {
      setModal({
        type: 'confirm',
        props: { title, message, confirmLabel, cancelLabel, onCancel: () => { setModal(null); resolve(false) }, onConfirm: () => { setModal(null); resolve(true) } }
      })
    })
  }, [])

  const contextValue = { showConfirm }

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modal && modal.type === 'confirm' && (
        <ConfirmDialog open={true} {...modal.props} />
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}

export default ModalContext
