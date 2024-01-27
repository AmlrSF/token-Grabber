// "use client" should be placed above the component function
"use client";


import { useState } from 'react';
type Headers = Record<string, string>;

export default function Home() {
  const [Message, setMessage] = useState('');




  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className='w-full sm:w-[450px]'>
        <input className="bg-gray-50 border border-gray-300
       text-gray-900 mb-5  rounded-lg
        focus:outline-none text-xl focus:border-primary-600 block w-full 
        p-5 "onChange={(e) => setMessage(e.target.value)} value={Message} />
        <button className='px-6 py-4 rounded-lg text-white w-full 
         bg-[#3188e4e4] text-xl font-bold ' >Send Message</button>
  
      </div>
    </main>
  );
}
