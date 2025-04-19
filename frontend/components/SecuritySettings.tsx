'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function SecuritySettings() {
  const { user, session } = useAuth();
  const [activeDevices, setActiveDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSecurityData = async () => {
      if (!session) return;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/sessions`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveDevices(data.sessions || []);
        }
      } catch (error) {
        console.error('Failed to fetch security data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSecurityData();
  }, [session]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`${anton.className} text-3xl mb-6`}>
        <span className="text-white">SECURITY</span>
        <span className="text-red-600">SETTINGS</span>
      </h1>
      
      <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
        
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : activeDevices.length > 0 ? (
          <div className="space-y-4">
            {activeDevices.map((device, i) => (
              <div key={i} className="flex justify-between items-center p-3 border border-red-900/30 bg-black/30">
                <div>
                  <p className="text-white">{device.device}</p>
                  <p className="text-sm text-gray-400">{device.location} • {new Date(device.lastActive).toLocaleDateString()}</p>
                </div>
                {device.current ? (
                  <span className="text-green-500 text-sm">Current</span>
                ) : (
                  <button className="text-red-500 text-sm hover:underline">Sign Out</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No active sessions found.</p>
        )}
      </div>
      
      <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6">
        <h2 className="text-xl font-semibold mb-4">Account Security</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-red-900/30">
            <div>
              <p className="text-white">Change Password</p>
              <p className="text-sm text-gray-400">Update your password regularly for better security</p>
            </div>
            <button className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600/10">
              Update
            </button>
          </div>
          
          <div className="flex justify-between items-center pb-4 border-b border-red-900/30">
            <div>
              <p className="text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600/10">
              Setup
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white">Connected Wallets</p>
              <p className="text-sm text-gray-400">Manage your linked blockchain wallets</p>
            </div>
            <button className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600/10">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}