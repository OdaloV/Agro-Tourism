// src/lib/hooks/useSettings.ts
import { useState, useEffect } from 'react';

interface PlatformSettings {
  commissionRate: number;
  minBookingAmount: number;
  maxGuestsPerBooking: number;
  verificationRequired: boolean;
  autoApprove: boolean;
  maintenanceMode: boolean;
  platformName: string;
  platformEmail: string;
  loading: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    commissionRate: 10,
    minBookingAmount: 300,
    maxGuestsPerBooking: 100,
    verificationRequired: true,
    autoApprove: false,
    maintenanceMode: false,
    platformName: 'HarvestHost',
    platformEmail: 'admin@harvesthost.com',
    loading: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings({
          commissionRate: parseInt(data.commission_rate) || 10,
          minBookingAmount: parseInt(data.min_booking_amount) || 300,
          maxGuestsPerBooking: parseInt(data.max_guests_per_booking) || 100,
          verificationRequired: data.verification_required === 'true',
          autoApprove: data.auto_approve === 'true',
          maintenanceMode: data.maintenance_mode === 'true',
          platformName: data.platform_name || 'HarvestHost',
          platformEmail: data.platform_email || 'admin@harvesthost.com',
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchSettings();
  }, []);
  
  return settings;
}