import React from 'react'
import Image from 'next/image'

const Icon = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Image
      src="/logo.png"
      alt="Dawana Africa Logo"
      width={200}
      height={80}
      style={{ padding: '10px 0' }}
    />
  </div>
)

export default Icon
