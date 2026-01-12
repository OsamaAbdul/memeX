import axios from 'axios';
import { useEffect, useState } from 'react';
import { ID_API_URL, USERS_API_URL } from 'config'; // Use generic config
import { useGetAccount } from 'lib';

const getUserProfileData = async (address?: string) => {
  if (!address) {
    return;
  }

  try {
    // If URLs are missing or dummy, this might fail. We handle it silently.
    if (!USERS_API_URL) return null;

    // Use full URL if provided, ignoring baseURL which might cause double-prefixing
    const url = USERS_API_URL.startsWith('http')
      ? `${USERS_API_URL}/${address}`
      : `${USERS_API_URL}${address}`;

    const { data } = await axios.get(url);

    return data;
  } catch (err) {
    // Suppress error log for profile fetch as it's optional and fails on devnet usually
    return null;
  }
};

export const useGetUserHerotag = () => {
  const { address } = useGetAccount();
  const [profileUrl, setProfileUrl] = useState('');
  const [herotag, setHerotag] = useState('');

  useEffect(() => {
    if (!address) {
      return;
    }

    const fetchUserProfileUrl = async () => {
      const data = await getUserProfileData(address);
      if (data) {
        setProfileUrl(data?.profile?.url);
        setHerotag(data?.herotag);
      }
    };

    fetchUserProfileUrl();
  }, [address]);

  return { herotag, profileUrl };
};
