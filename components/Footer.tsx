
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 mt-12 border-t border-white/10">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Urnisa. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
