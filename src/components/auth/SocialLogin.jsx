import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';

const SocialLogin = () => {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button
          type="button"
          className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow transition-all duration-200"
        >
          <FcGoogle className="w-5 h-5 mr-3" />
          Continue with Google
        </button>
        <button
          type="button"
          className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow transition-all duration-200"
        >
          <BsMicrosoft className="w-5 h-5 mr-3 text-blue-600" />
          Continue with Microsoft
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
