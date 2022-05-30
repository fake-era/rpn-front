import React from 'react'

export default function MyButton({children, ...props}) {
  return (
    <button className='px-16 py-1 rounded bg-sky-400 text-white' {...props}>
        {children}
    </button>
  )
}
