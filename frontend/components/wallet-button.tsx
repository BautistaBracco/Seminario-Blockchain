"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/hooks/use-web3"

export function WalletButton() {
  const { account, isConnected, loading, connectWallet } = useWeb3()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const displayAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Conectar Wallet"

  return (
    <Button onClick={connectWallet} disabled={loading} variant={isConnected ? "default" : "outline"}>
      {loading ? "Conectando..." : displayAddress}
    </Button>
  )
}
