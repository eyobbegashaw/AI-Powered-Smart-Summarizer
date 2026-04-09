// import React, { useState, useEffect } from 'react';
// import { Loader2 } from 'lucide-react';
// // አዲሶቹን icons እዚህ ጋር እናስገባለን
// import { FcGoogle } from 'react-icons/fc'; 
// import { FaGithub } from 'react-icons/fa'; // Github ደግሞ ከ Font Awesome (fa) ይሻላል

// const OAuthButtons = () => {
//   const [loading, setLoading] = useState(null);
//   const [providers, setProviders] = useState([]);

//   useEffect(() => {
//     fetchOAuthProviders();
//   }, []);

//   const fetchOAuthProviders = async () => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/oauth/providers`);
//       const data = await response.json();
//       setProviders(data.providers || []);
//     } catch (error) {
//       console.error('Failed to fetch OAuth providers:', error);
//     }
//   };

//   const handleOAuthLogin = (provider) => {
//     setLoading(provider.name);
//     window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider.name}/login`;
//   };

//   // የ Icon አመራረጥ እዚህ ጋር ተቀይሯል
//   const getProviderIcon = (providerName) => {
//     switch (providerName.toLowerCase()) {
//       case 'google':
//         return <FcGoogle className="h-5 w-5" />; // ባለቀለም Google icon
//       case 'github':
//         return <FaGithub className="h-5 w-5 text-[#24292e] dark:text-white" />;
//       default:
//         return null;
//     }
//   };

//   const getProviderColor = (providerName) => {
//     switch (providerName.toLowerCase()) {
//       case 'google':
//         return 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700';
//       case 'github':
//         return 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700';
//       default:
//         return 'hover:bg-gray-50';
//     }
//   };

//   if (!providers || providers.length === 0) return null;

//   return (
//     <div className="mt-6 animate-fadeIn">
//       <div className="relative mb-6">
//         <div className="absolute inset-0 flex items-center">
//           <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
//         </div>
//         <div className="relative flex justify-center text-sm">
//           <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 font-medium">
//             Or continue with
//           </span>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {providers.map((provider) => (
//           <button
//             key={provider.name}
//             onClick={() => handleOAuthLogin(provider)}
//             disabled={loading !== null}
//             className={`
//               flex items-center justify-center gap-3 px-4 py-2.5 
//               border rounded-xl shadow-sm transition-all duration-200
//               active:scale-95 disabled:opacity-50
//               ${getProviderColor(provider.name)}
//               text-gray-700 dark:text-white font-semibold text-sm
//             `}
//           >
//             {loading === provider.name ? (
//               <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
//             ) : (
//               getProviderIcon(provider.name)
//             )}
//             <span>
//               {provider.display_name}
//             </span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default OAuthButtons;

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const OAuthButtons = () => {
  const [loading, setLoading] = useState(null);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetchOAuthProviders();
  }, []);

  const fetchOAuthProviders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/oauth/providers`);
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Failed to fetch OAuth providers:', error);
      // Fallback providers if API fails
      setProviders([
        { name: 'google', display_name: 'Google' },
        { name: 'github', display_name: 'GitHub' }
      ]);
    }
  };

  const handleOAuthLogin = (provider) => {
    setLoading(provider.name);
    // Store current page to redirect back after OAuth
    localStorage.setItem('oauth_redirect_path', window.location.pathname);
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider.name}/login`;
  };

  const getProviderIcon = (providerName) => {
    switch (providerName.toLowerCase()) {
      case 'google':
        return <FcGoogle className="h-5 w-5" />;
      case 'github':
        return <FaGithub className="h-5 w-5 text-[#24292e] dark:text-white" />;
      default:
        return null;
    }
  };

  const getProviderColor = (providerName) => {
    switch (providerName.toLowerCase()) {
      case 'google':
        return 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700';
      case 'github':
        return 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'hover:bg-gray-50';
    }
  };

  if (!providers || providers.length === 0) return null;

  return (
    <div className="mt-6 animate-fadeIn">
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => handleOAuthLogin(provider)}
            disabled={loading !== null}
            className={`
              flex items-center justify-center gap-3 px-4 py-2.5 
              border rounded-xl shadow-sm transition-all duration-200
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              ${getProviderColor(provider.name)}
              text-gray-700 dark:text-white font-semibold text-sm
            `}
          >
            {loading === provider.name ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              getProviderIcon(provider.name)
            )}
            <span>
              {provider.display_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OAuthButtons;