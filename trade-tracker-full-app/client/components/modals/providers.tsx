"use client";

import { createContext, Dispatch, ReactNode, SetStateAction } from "react";

import { useSignInModal } from "@/components/modals/sign-in-modal";
import { TermsAcceptanceProvider } from "@/components/providers/terms-acceptance-provider";

export const ModalContext = createContext<{
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}>({
  setShowSignInModal: () => {},
});

export default function ModalProvider({ children }: { children: ReactNode }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();

  return (
    <ModalContext.Provider
      value={{
        setShowSignInModal,
      }}
    >
      <SignInModal />
      <TermsAcceptanceProvider>{children}</TermsAcceptanceProvider>
    </ModalContext.Provider>
  );
}
