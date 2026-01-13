import axios from 'axios';
import { useState } from 'react';
import { API_URL } from 'config';
import { ProfileType } from 'types';

import { useGetAccount } from 'lib';

export const useGetProfile = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useGetAccount();

  const getProfile = async () => {
    if (!address) return;
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/accounts/${address}`, {
        baseURL: API_URL
      });

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Unable to fetch profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, getProfile, isLoading };
};
